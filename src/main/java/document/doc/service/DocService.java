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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
     * 문서 삭제
     */
    public void deleteDoc(DocDto docDto) throws Exception {


        Path filePath = Paths.get(docDto.getDocFilepath());
        if (Files.exists(filePath)) {
            try {
                Files.delete(filePath);
            } catch (IOException e) {
                throw new Exception("파일 삭제 실패: " + filePath.toString(), e);
            }
        }

        int deleted = docMapper.deleteDoc(docDto);
        if (deleted <= 0) {
            throw new Exception("문서 DB 삭제 실패. docId: " + docDto.getDocId());
        }
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


        int inserted = docMapper.insertDoc(insertDocDto);
        if (inserted <= 0) {
            throw new Exception("문서 등록에 실패했습니다. docName: " + docDto.getDocName());
        }
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

//        // 변환 실패 상태가 맞는지 확인
//        if(!docDto.getDocStatus().equals("9")){
//            throw new Exception("변환상태가 실패가 아닙니다.");
//        }

        // 확장자 다른 api
        String ext = "";
        String saveFilename = docDto.getSaveFilename().toLowerCase();
        int dotIndex = saveFilename.lastIndexOf('.');
        ext = saveFilename.substring(dotIndex + 1);

        if(docDto.getOcryn().equals("1")){
            switch (ext) {
                case "gif":
                case "jpeg":
                case "jpg":
                case "png":
                case "bmp":
                    log.info("이미지 파일입니다.");
                    return transOcr( apiProps.getOcr(),  docDto, "img");

                case "pdf":
                    log.info("pdf 파일입니다.");
                    return transOcr( apiProps.getOcr(),  docDto, "pdf");

                default:
                    throw new Exception("지원하지 않는 파일 형식입니다.");
            }
        } else {
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
                    return transXlsx(apiProps.getXlsx(),docDto);

                case "ppt":
                case "pptx":
                    log.info("파워포인트 ppt, pptx 파일입니다.");
                    return transPptx( apiProps.getPptx(), docDto);

                case "txt":
                    log.info("텍스트 파일입니다.");
                    return "";

                case "gif":
                case "jpeg":
                case "jpg":
                case "png":
                case "bmp":
                    log.info("이미지 파일입니다.");
                    return transOcr( apiProps.getOcr(),  docDto, "img");

                case "pdf":
                    log.info("pdf 파일입니다.");
                    return transPdf( apiProps.getPdf(),  docDto);

                default:
                    throw new Exception("지원하지 않는 파일 형식입니다.");
            }
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
        if (!file.exists()) {

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.NOFILE.getDbCode())
                    .build());

            throw new Exception(TransStatus.NOFILE.getMsgFilePath(file.getPath()));


        }

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
        if (!file.exists()) {

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.NOFILE.getDbCode())
                    .build());

            throw new Exception(TransStatus.NOFILE.getMsgFilePath(file.getPath()));


        }

        ApiDocxResponse response = webClient.post()
                .uri("/convert/")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiDocxResponse.class)
                .doOnError(Throwable::printStackTrace)
                .block();

        return processConversionResponse(response, docDto);
    }

    /**
     * PDF API 변환 요청
     */
    public String transPdf(String apiUrlPdf, DocDto docDto) throws Exception {
        String pdfHost = apiProps.getPdfHost();
        String pdfPort = apiProps.getPdfPort();

        apiUrlPdf = buildApiUrl(pdfHost, pdfPort, apiUrlPdf);
        WebClient webClient = createWebClient(apiUrlPdf);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());
        if (!file.exists()) {

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.NOFILE.getDbCode())
                    .build());

            throw new Exception(TransStatus.NOFILE.getMsgFilePath(file.getPath()));


        }

        ApiPdfResponse response = webClient.post()
                .uri("/api/convert")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiPdfResponse.class)
                .doOnError(Throwable::printStackTrace)
                .block();

        return processConversionResponse(response, docDto);
    }


    /**
     * PDF/IMG OCR API 변환 요청
     */
    public String transOcr(String apiUrlOcr, DocDto docDto, String fileType) throws Exception {
        String ocrHost = apiProps.getOcrHost();
        String ocrPort = apiProps.getOcrPort();

        apiUrlOcr = buildApiUrl(ocrHost, ocrPort, apiUrlOcr);
        WebClient webClient = createWebClient(apiUrlOcr);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());
        if (!file.exists()) {

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.NOFILE.getDbCode())
                    .build());

            throw new Exception(TransStatus.NOFILE.getMsgFilePath(file.getPath()));

        }

        String uriSet = "";
        if("pdf".equals(fileType)) {
            uriSet = "/extract/pdf";
        } else if("img".equals(fileType)) {
            uriSet = "/extract/image";
        }

        ApiOcrResponse response = webClient.post()
                .uri(uriSet)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiOcrResponse.class)
                .doOnError(e -> e.printStackTrace())
                .block();

        return processConversionOcrResponse(docDto, response.task_id, webClient);
    }

    /**
     * Pptx API 변환 요청
     */
    private String transPptx(String apiUrlPptx, DocDto docDto) throws Exception {

        String pptxHost = apiProps.getPptxHost();
        String pptxPort = apiProps.getPptxPort();

        apiUrlPptx = buildApiUrl(pptxHost, pptxPort, apiUrlPptx);
        WebClient webClient = createWebClient(apiUrlPptx);


        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());

        // API 호출
        ApiPptxResponse response = webClient.post()
                .uri("/convert/")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToMono(ApiPptxResponse.class)
                .doOnError(e -> e.printStackTrace())
//                    .bodyToMono(String.class) //그냥  String 으로 받을때
                .block();


        return processConversionResponse(response, docDto);

    }

    /**
     * Xlsx API 변환 요청
     */
    public String transXlsx(String apiUrlXlsx, DocDto docDto) throws Exception {

        String XlsxHost = apiProps.getXlsxHost();
        String XlsxPort = apiProps.getXlsxPort();

        apiUrlXlsx = buildApiUrl(XlsxHost, XlsxPort, apiUrlXlsx);
        WebClient webClient = createWebClient(apiUrlXlsx);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());


        if (!file.exists()) {

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.NOFILE.getDbCode())
                    .build());

            throw new Exception(TransStatus.NOFILE.getMsgFilePath(file.getPath()));
        }

        // API 호출
        List<ApiXlsxResponse> response = webClient.post()
                .uri("/convert")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file))
                .retrieve()
                .bodyToFlux(ApiXlsxResponse.class) // 배열을 Flux로
                .collectList()                     // Flux -> List
                .doOnError(e -> e.printStackTrace())
//                    .bodyToMono(String.class) //그냥  String 으로 받을때
                .block();

        return processConversionXlsxResponse(response, docDto);
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

        TransStatus resultStatus = TransStatus.fromApiStatus(response);
        String mergedHtml = "";

        // 상태에 따라 분기 처리
        switch (resultStatus) {
            case SUCCESS:
                mergedHtml = String.join("<!--PAGE_BREAK-->", response.getHtmlContent());

                int updated = docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(resultStatus.getDbCode())
                        .transHtml(mergedHtml)
                        .build());

                if (updated <= 0) {
                    throw new Exception("문서 변환 결과 DB 업데이트 실패. docId: " + docDto.getDocId());
                }

                return resultStatus.getMessage();

            default:
                updated = docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .transHtml(mergedHtml)
                        .build());

                if (updated <= 0) {
                    throw new Exception("문서 변환 실패 상태 DB 업데이트 실패. docId: " + docDto.getDocId());
                }

                String errMsg = TransStatus.FAILURE.getMessage();
                String detailedMsg = response != null ? response.getErrorMessage() : null;
                if (detailedMsg != null) {
                    errMsg += " " + detailedMsg;
                }

                throw new Exception(errMsg);
        }
    }

    /**
     * 엑셀 변환용
     */
    private String processConversionXlsxResponse(List<ApiXlsxResponse> response, DocDto docDto) throws Exception {
        String mergedHtml = "";

        if (response == null || response.isEmpty()) {
            // fail 업데이트 로직
            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus(TransStatus.FAILURE.getDbCode())
                    .transHtml(mergedHtml)
                    .build());

            throw new Exception("서버에서 시트 데이터를 받지 못했습니다.");
        }

        mergedHtml = response.stream()
                .map(r -> "<h1>" + r.getSheet_name() + "</h1>" + r.getSheet_html())
                .collect(Collectors.joining("<!--PAGE_BREAK-->"));

        int updated = docMapper.updateTrans(docDto.toBuilder()
                .docStatus(TransStatus.SUCCESS.getDbCode())
                .transHtml(mergedHtml)
                .build());

        if (updated <= 0) {
            throw new Exception(TransStatus.FAILURE.getMessage());
        }

        return TransStatus.SUCCESS.getMessage();
    }




    /**
     * PDF/IMG 변환 요청에서 Task 상태 확인 및 DB 업데이트 로직 분리
     */
    private String processConversionOcrResponse(DocDto docDto, String task_id, WebClient webClient) throws Exception {
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


        int updated = docMapper.updateTrans(docDto.toBuilder()
                .transTaskid(task_id)
                .build());

        if (updated <= 0) {
            throw new Exception("Task ID DB 업데이트 실패. docId: " + docDto.getDocId());
        }

        // 상태를 TransStatus Enum으로 변환
        TransStatus transStatus = TransStatus.fromApiStatus(taskResponse);

        // 상태별 처리
        switch (transStatus) {
            case SUCCESS:
                toHtml = taskResponse.getResult().getOcr_gen().getHtml().get(0);
                updated = docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(transStatus.getDbCode())
                        .transHtml(toHtml)
                        .build());
                if (updated <= 0) {
                    throw new Exception("PDF/IMG 변환 결과 DB 업데이트 실패. docId: " + docDto.getDocId());
                }
                return transStatus.getMessage();

            case PENDING:
                updated  = docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(transStatus.getDbCode())
                        .transHtml(toHtml)
                        .build());
                if (updated <= 0) {
                    throw new Exception("PDF/IMG PENDING 상태 DB 업데이트 실패. docId: " + docDto.getDocId());
                }
                return transStatus.getMessage();

            case FAILURE:
            default:
                updated = docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .transHtml(toHtml)
                        .build());

                if (updated <= 0) {
                    throw new Exception("PDF/IMG 변환 실패 DB 업데이트 실패. docId: " + docDto.getDocId());
                }


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
