package document.doc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import document.config.TransDocApiProperties;
import document.config.TransServerProperties;
import document.doc.dto.*;
import document.doc.mapper.DocMapper;
import document.user.dto.UserDto;
import io.netty.channel.ChannelOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import reactor.netty.http.client.HttpClient;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocService {

    @Value("${file.upload.path}")
    private String uploadPath;

    @Value("${spring.profiles.active}")
    private String serverType;

    private final DocMapper docMapper;
    private final TransServerProperties servProp;
    private final TransDocApiProperties apiProps;

    /**
     * 문서 리스트
     */
    public List<DocDto> getDocList(DocDto docDto) {
        return docMapper.getDocList(docDto);
    }

    /**
     * 변환된 HTML 문서
     */
    public DocDto getTransHtml(DocDto docDto) {
        return docMapper.getDocrByDocId(docDto);
    }


    /**
     * 사용자 정보 삭제
     */
    public void deleteDoc(DocDto docDto) throws IOException {

        Path filePath = Paths.get(docDto.getDocFilepath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        docMapper.deleteDoc(docDto);
    }


    /**
     * 문서 등록
     */
    public void saveDocument(DocDto docDto, UserDto userDto) throws Exception {
        String serverNum = resolveCurrentServerNumber();

        String orgFilename = docDto.getFile().getOriginalFilename(); // 예: "myDocument.pdf"
        String extension = orgFilename.substring(orgFilename.lastIndexOf(".")); // 확장자 추출
        String saveFilename = UUID.randomUUID().toString() +extension;

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        // uploadPath 디렉토리가 없으면 생성
        Path baseDir = Paths.get(uploadPath);
        if (!Files.exists(baseDir)) {
            Files.createDirectories(baseDir);
        }

        // 2날짜별 디렉토리 생성
        Path uploadDir = baseDir.resolve(today);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 실제 파일 저장 경로 (uploadPath + 파일명)
        Path filePath = uploadDir.resolve(saveFilename);
        Files.copy(docDto.getFile().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // DTO 구성
        DocDto insertDocDto = DocDto.builder()
                .docName(docDto.getDocName())
                .orgFilename(orgFilename)
                .saveFilename(saveFilename)
                .docFilepath(filePath.toString())
                .serverNum(serverNum)
                .ocryn(docDto.getOcryn())
                .crtId(userDto.getUserId())
                .build();


        docMapper.insertDoc(insertDocDto);
    }


    /**
     * 현재 서버 번호를 반환
     * server2와 IP가 일치하면 "2", 아니면 기본 "1"
     */
    private String resolveCurrentServerNumber() {
        try {
            String currentIp = InetAddress.getLocalHost().getHostAddress();
            if (servProp.getServer2() != null && servProp.getServer2().equals(currentIp)) {
                return "2";
            } else {
                return "1";
            }
        } catch (UnknownHostException e) {
            return "1"; // 오류 시 기본값
        }
    }


    /**
     * 각각의 확장자 마다 API 호출
     */
    public String apiTransfer(DocDto docDto) throws Exception {

        // 변환 실패 상태가 맞는지 확인
        if(!docDto.getDocStatus().equals("9")){
            throw new Exception("변환상태가 실패가 아닙니다.");
        }

        // 확장자 다른 api
        String ext = "";
        String saveFilename = docDto.getSaveFilename().toLowerCase();
        int dotIndex = saveFilename.lastIndexOf('.');
        ext = saveFilename.substring(dotIndex + 1);

        switch (ext) {
            case "doc":
            case "docx":
                log.info("doc, docx 파일입니다.");
                return transDocx(apiProps.getDocx(), docDto);

            case "hwp":
                log.info("hwp 파일입니다.");
                return transHwp(apiProps.getHwp(), docDto);


            case "xls":
            case "xlsx":
                log.info("엑셀 xls, xlsx 파일입니다.");
                return "";

            case "ppt":
            case "pptx":
                log.info("파워포인트 ppt, pptx 파일입니다.");
                return "";

            case "txt":
                log.info("텍스트 파일입니다.");
                return "";

            case "gif":
            case "jpeg":
            case "jpg":
            case "png":
            case "bmp":
                log.info("이미지 파일입니다.");
                return transPdf( apiProps.getOcr(),  docDto, "img");

            case "pdf":
                log.info("pdf 파일입니다.");
                return transPdf( apiProps.getOcr(),  docDto, "pdf");

            default:
                throw new Exception("지원하지 않는 파일 형식입니다.");
        }

    }

    /**
    * HWP API 변환 요청
    */
    public String transHwp(String apiUrlHwp, DocDto docDto) throws Exception {
        String hwpHost = apiProps.getHwpHost();
        String hwpPort = apiProps.getHwpPort();

        apiUrlHwp = buildApiUrl(hwpHost, hwpPort, apiUrlHwp);
        WebClient webClient = createWebClient(apiUrlHwp);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());
        if (!file.exists()) throw new Exception("변환할 파일이 존재하지 않습니다: " + file.getPath());

        ApiHwpResponse response = webClient.post()
                .uri("/convert")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiHwpResponse.class)
                .doOnError(Throwable::printStackTrace)
                .block();

        return processConversionResponse(response, docDto);
    }


    /**
     * DOC/DOCX API 변환 요청
     */
    public String transDocx(String apiUrlDocx, DocDto docDto) throws Exception {
        String docxHost = apiProps.getDocxHost();
        String docxPort = apiProps.getDocxPort();

        apiUrlDocx = buildApiUrl(docxHost, docxPort, apiUrlDocx);
        WebClient webClient = createWebClient(apiUrlDocx);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());
        if (!file.exists()) throw new Exception("변환할 파일이 존재하지 않습니다: " + file.getPath());

        ApiDocxResponse response = webClient.post()
                .uri("/convert")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiDocxResponse.class)
                .doOnError(Throwable::printStackTrace)
                .block();

        return processConversionResponse(response, docDto);
    }

    /**
     * PDF/IMG API 변환 요청
     */
    public String transPdf(String apiUrlOcr, DocDto docDto, String fileType) throws Exception {
        String ocrHost = apiProps.getOcrHost();
        String ocrPort = apiProps.getOcrPort();

        apiUrlOcr = buildApiUrl(ocrHost, ocrPort, apiUrlOcr);
        WebClient webClient = createWebClient(apiUrlOcr);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());
        if (!file.exists()) throw new Exception("변환할 파일이 존재하지 않습니다: " + file.getPath());

        String uriSet = "";
        if("pdf".equals(fileType)) {
            uriSet = "/extract/pdf";
        } else if("img".equals(fileType)) {
            uriSet = "/extract/image";
        }

        ApiPdfResponse response = webClient.post()
                .uri(uriSet)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiPdfResponse.class)
                .doOnError(e -> e.printStackTrace())
                .block();

        return processConversionPdfResponse(docDto, response.task_id, webClient);
    }


    /**
     * 서버 접속 URL 생성
     */
    private String buildApiUrl(String host, String port, String originalUrl) throws Exception {
        if (!"local".equals(serverType)) {
            try {
                String ip = InetAddress.getByName(host).getHostAddress();
                return "http://" + ip + ":" + port;
            } catch (UnknownHostException e) {
                throw new RuntimeException("서버 IP 확인 중 오류 발생: " + e.getMessage());
            }
        }
        return originalUrl;
    }


    /**
     * WebClient 인스턴스를 생성
     */
    private WebClient createWebClient(String apiUrl) {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(50 * 1024 * 1024))
                .build();

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMinutes(2))
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 60000);

        return WebClient.builder()
                .baseUrl(apiUrl.trim())
                .exchangeStrategies(strategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }


    /**
     * 문서 변환 API의 응답 결과를 처리
     */
    private <T extends ApiResponseBase> String processConversionResponse(T response, DocDto docDto) throws Exception {

        TransStatus resultStatus = TransStatus.fromApiStatus(response.status);
        String mergedHtml = "";

        // 상태에 따라 분기 처리
        switch (resultStatus) {
            case SUCCESS:
                mergedHtml = String.join("<!--PAGE_BREAK-->", response.html_content);

                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(resultStatus.getDbCode())
                        .transHtml(mergedHtml)
                        .build());

                return resultStatus.getMessage();

            default:
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .transHtml(mergedHtml)
                        .build());

                String errMsg = TransStatus.FAILURE.getMessage();
                String detailedMsg = response != null ? response.getErrorMessage() : null;
                if (detailedMsg != null) {
                    errMsg += " " + detailedMsg;
                }

                throw new Exception(errMsg);
        }
    }


    /**
     * PDF/IMG 변환 요청에서 Task 상태 확인 및 DB 업데이트 로직 분리
     */
    private String processConversionPdfResponse(DocDto docDto, String task_id, WebClient webClient) throws Exception {
        String toHtml = "";

        if (task_id == null) {

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.FAILURE.getDbCode())
                    .transHtml(toHtml)
                    .build());

            throw new Exception(TransStatus.FAILURE.getMessage() + " (Task ID 없음)");

        }


        ApiTaskResponse taskResponse = webClient.get()
                .uri("/task/{id}", task_id)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(ApiTaskResponse.class)
                .block();


        docMapper.updateTrans(docDto.toBuilder()
                .transTaskid(task_id)
                .build());

        // 상태를 TransStatus Enum으로 변환
        TransStatus transStatus = TransStatus.fromApiStatus(taskResponse.getStatus());

        // 상태별 처리
        switch (transStatus) {
            case SUCCESS:
                toHtml = taskResponse.getResult().getOcr_gen().getHtml().get(0);
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(transStatus.getDbCode())
                        .transHtml(toHtml)
                        .build());
                return transStatus.getMessage();

            case PENDING:
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(transStatus.getDbCode())
                        .transHtml(toHtml)
                        .build());
                return transStatus.getMessage();

            case FAILURE:
            default:
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .transHtml(toHtml)
                        .build());

                ObjectMapper mapper = new ObjectMapper();
                String errMsg = transStatus.getMessage();
                String detailedMsg = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(taskResponse);
                if (detailedMsg != null) {
                    errMsg += " " + detailedMsg;
                }

                throw new Exception(errMsg);
        }
    }




}
