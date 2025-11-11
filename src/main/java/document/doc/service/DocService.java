package document.doc.service;

import document.config.TransDocApiProperties;
import document.config.TransServerProperties;
import document.doc.dto.ApiDocxResponse;
import document.doc.dto.ApiHwpResponse;
import document.doc.dto.DocDto;
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

    public void apiTransfer(DocDto docDto) throws Exception {

        // 변환 실패 상태가 맞는지 확인
        if(!docDto.getDocStatus().equals("9")){
            throw new Exception("변환상태가 실패가 아닙니다.");
        }

        String save_filename = docDto.getSaveFilename();

        if (save_filename.toLowerCase().endsWith(".doc") || save_filename.toLowerCase().endsWith(".docx")) {
            log.info("doc , docx 파일입니다.");
            transDocx( apiProps.getDocx(),  docDto);
        }else if (save_filename.toLowerCase().endsWith(".hwp")) {
            log.info("hwp 파일입니다.");
            transHwp( apiProps.getHwp(), docDto);
        }else if (save_filename.toLowerCase().endsWith(".xlx") || save_filename.toLowerCase().endsWith(".")) {
            log.info("엑셀 xlx,xlsx 파일입니다.");
        }else if (save_filename.toLowerCase().endsWith(".ppt") || save_filename.toLowerCase().endsWith(".pptx")) {
            log.info("파워포인트 ppt, pptx 파일입니다.");
        }else if (save_filename.toLowerCase().endsWith(".txt")) {
            log.info("텍스트 파일입니다.");
        }else if (save_filename.toLowerCase().endsWith(".gif") || save_filename.toLowerCase().endsWith(".jpeg") || save_filename.toLowerCase().endsWith(".jpg")
                || save_filename.toLowerCase().endsWith(".png") || save_filename.toLowerCase().endsWith("bmp")) {
            log.info("이미지 파일입니다.");
        }else {
            throw new Exception("지원하지 않는 파일 형식입니다.");
        }
    }



    // DOCX 문서변환 요청
    public void transDocx(String apiUrlDocx, DocDto docDto) throws Exception {
        String docxHost = apiProps.getDocxHost();
        String docxPort = apiProps.getDocxPort();
        String ocrHost = apiProps.getOcrHost();
        String ocrPort = apiProps.getOcrPort();
        String ip = null;

        if (!serverType.equals("local")) {
            try {
                log.info("{} ip: {}", docxHost, InetAddress.getByName(docxHost).getHostAddress());
                ip = InetAddress.getByName(docxHost).getHostAddress();
                apiUrlDocx = "http://" + ip + ":" + docxPort;
            } catch (UnknownHostException e) {
                e.printStackTrace();
                throw new RuntimeException("DOCX 변환 서버 IP 확인 중 오류가 발생했습니다: " + e.getMessage());
            }
        }

        // 버퍼 크기 늘리기 (기본: 256KB)
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(50 * 1024 * 1024)) // 50MB
                .build();

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMinutes(2))  // 서버 응답 대기 시간
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 60000); // 연결 타임아웃

        WebClient webClient = WebClient.builder()
                .baseUrl(apiUrlDocx.trim())
                .exchangeStrategies(strategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();

        FileSystemResource file2 = new FileSystemResource(docDto.getDocFilepath());


        // 파일 존재 여부 체크
        if (!file2.exists()) {
            throw new Exception("변환할 파일이 존재하지 않습니다: " + file2.getPath());
        }

        // API 호출
        ApiDocxResponse response = webClient.post()
                .uri("/convert/")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file2))
                .retrieve()
                .bodyToMono(ApiDocxResponse.class)
                .doOnError(Throwable::printStackTrace)
                .block();

        // 응답 확인 및 DB 저장
        if (response != null && "success".equalsIgnoreCase(response.status)) {
            log.info("변환 성공 → DB 저장 중...");

            String mergedHtml = String.join("<!--PAGE_BREAK-->", response.html_content);

            docMapper.updateTrans(docDto.toBuilder()
                            .docStatus("2")
                            .transHtml(mergedHtml)
                            .build());


            log.info("DB 저장 완료!");
        } else {
            log.info("변환 실패");

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus("9")
                    .build());

            // 상세 메시지 출력
            String errMsg = "문서 변환 중 오류가 발생했습니다: ";
            if (response != null && response.messages != null) {
                errMsg += ": " + String.join(", ", response.messages);
            }

            throw new Exception(errMsg);
        }

    }



    //HWP 문서변환 요청
    public void transHwp(String apiUrlHwp, DocDto docDto) throws Exception {
        String hwpHost = apiProps.getHwpHost();
        String hwpPort = apiProps.getHwpPort();

        String ip = null;
        if(!serverType.equals("local")) {
            try {
                ip = InetAddress.getByName(hwpHost).getHostAddress();
                apiUrlHwp = "http://" + ip + ":" + hwpPort;
            } catch (UnknownHostException e) {
                e.printStackTrace();
                throw new RuntimeException("HWP 변환 서버 IP 확인 중 오류가 발생했습니다: " + e.getMessage());
            }
        }

        // 버퍼 크기 늘리기 (기본: 256KB)
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(50 * 1024 * 1024)) // 50MB
                .build();

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMinutes(2))  // 서버 응답 대기 시간
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 60000); // 연결 타임아웃

        WebClient webClient = WebClient.builder()
                .baseUrl(apiUrlHwp.trim())
                .exchangeStrategies(strategies)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();

        FileSystemResource file2 = new FileSystemResource(docDto.getDocFilepath());
        // API 호출
        ApiHwpResponse response = webClient.post()
                .uri("/convert")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", file2))
                .retrieve()
                .bodyToMono(ApiHwpResponse.class)
                .doOnError(e -> e.printStackTrace())
//                    .bodyToMono(String.class) //그냥  String 으로 받을때
                .block();

        // 응답 확인 및 DB 저장
        if (response != null && "success".equalsIgnoreCase(response.status)) {
            log.info("변환 성공 → DB 저장 중...");

            String mergedHtml = String.join("<!--PAGE_BREAK-->", response.html_content);

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus("2")
                    .transHtml(mergedHtml)
                    .build());

            log.info("DB 저장 완료!");
        } else {
            log.info("변환 실패");

            docMapper.updateTrans(docDto.toBuilder()
                    .docStatus("9")
                    .build());

            throw new Exception("문서 변환 중 오류가 발생했습니다.");
        }

    }

}
