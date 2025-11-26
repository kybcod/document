package document.scheduler.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import document.config.TransDocApiProperties;
import document.config.TransServerProperties;
import document.doc.dto.*;
import document.doc.mapper.DocMapper;
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
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final DocMapper docMapper;
    private final TransServerProperties servProp;
    private final TransDocApiProperties apiProps;

    @Value("${spring.profiles.active}")
    private String serverType;

    public void connection() {
        log.info("==== 스케쥴러 실행됨 ====");

        String apiUrlOcr = apiProps.getOcr();

        //파일변환 API
        docuTansApi();
        //전환 보류 상태 확인
        taskCheck(apiUrlOcr);
    }

    //파일변환 API
    public void docuTansApi() {

        String apiUrlDocx = apiProps.getDocx();
        String apiUrlHwp = apiProps.getHwp();
        String apiUrlOcr = apiProps.getOcr();
        String apiUrlPptx = apiProps.getPptx();
        String apiUrlXlsx = apiProps.getXlsx();

        String serverNum = resolveCurrentServerNumber();

        try {
            int statusSet = docMapper.getDocCountByStatus("1");
            if (statusSet > 0) {
                log.info("1시간 내 처리중 문서가 존재하여 다음 시간으로 패스");
                return;
            }
        } catch (Exception e) {
            log.error("신청 중인 문서 수 조회 실패", e);
            return;
        }

        List<DocDto> list;
        try {
            list = docMapper.getDocListByServer(serverNum);
        } catch (Exception e) {
            log.error("문서 목록 조회 실패", e);
            return;
        }

        log.info("문서 건수: {}", list.size());

        for (DocDto docDto : list) {
            Long doc_id = Long.valueOf(docDto.getDocId());
            String save_filename = docDto.getSaveFilename();
            String doc_filepath = docDto.getDocFilepath();
            String ocryn = docDto.getOcryn();
            log.info("처리 시작 DOC_ID={}", doc_id);

            try {
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.REGISTRY.getDbCode())
                        .build());
            } catch (Exception e) {
                e.printStackTrace();
                log.error("문서 상태 처리중(1) 업데이트 실패 - DOC_ID={}", doc_id, e);
                continue;
            }

            File file = new File(doc_filepath);
            // 파일이 존재하는지 확인
            if (!file.exists()) {
                log.info("파일이 존재하지 않습니다: " + file.getAbsolutePath());
                try { //파일이 없으면 상태를 8 로 하자
                    docMapper.updateTrans(docDto.toBuilder()
                            .docStatus(TransStatus.NOFILE.getDbCode())
                            .build());
                } catch (Exception e) {
                    e.printStackTrace();
                }
                continue;
            }

            if (save_filename == null) {
                log.error("파일명이 NULL - DOC_ID={}", doc_id);
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .build());
                continue;
            }

            String filename = save_filename.toLowerCase();

            try {

                if ("1".equals(ocryn)) {
                    log.info("OCR 변환 시작 - DOC_ID={}", doc_id);
                    handleOcrConvert(filename, docDto, apiUrlOcr);
                } else {
                    log.info("일반 변환 시작 - DOC_ID={}", doc_id);
                    handleNormalConvert(filename, docDto, apiUrlDocx, apiUrlHwp, apiUrlXlsx, apiUrlPptx);
                }

            } catch (Exception e) {
                log.error("문서 변환 실패 - DOC_ID={}", doc_id, e);
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .build());
                continue;
            }

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

    private void handleOcrConvert(String filename, DocDto docDto, String apiUrlOcr) throws Exception {

        if (filename.endsWith(".pdf")) {
            transPdf(apiUrlOcr, docDto, "pdf");
        } else if (filename.endsWith(".gif") || filename.endsWith(".jpg") ||
                filename.endsWith(".jpeg") || filename.endsWith(".png") ||
                filename.endsWith(".bmp")) {
            transPdf(apiUrlOcr, docDto, "img");
        } else {
            throw new UnsupportedOperationException("지원하지 않는 파일입니다: " + filename);
        }
    }

    private void handleNormalConvert( String filename, DocDto docDto,
                                      String apiUrlDocx, String apiUrlHwp, String apiUrlXlsx, String apiUrlPptx) throws Exception {

        if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
            transDocx(apiUrlDocx, docDto);

        } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
            transXlsx(apiUrlXlsx, docDto);

        } else if (filename.endsWith(".pptx")  || filename.endsWith(".ppt")) {
            transPptx(apiUrlPptx, docDto);

        } else if (filename.endsWith(".hwp")) {
            transHwp(apiUrlHwp, docDto);
        } else {
            throw new UnsupportedOperationException("지원하지 않는 파일입니다: " + filename);
        }
    }

    public String transPdf(String apiUrlOcr, DocDto docDto, String fileType) throws Exception {
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

    public String transXlsx(String apiUrlXlsx, DocDto docDto) throws Exception {

        String XlsxHost = apiProps.getXlsxHost();
        String XlsxPort = apiProps.getXlsxPort();

        apiUrlXlsx = buildApiUrl(XlsxHost, XlsxPort, apiUrlXlsx);
        WebClient webClient = createWebClient(apiUrlXlsx);

        FileSystemResource file = new FileSystemResource(docDto.getDocFilepath());

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

            throw new Exception("문서 변환 실패 상태 DB 업데이트 실패. docId: " + docDto.getDocId());
        }

        mergedHtml = response.stream()
                .map(r -> "<h1>" + r.getSheet_name() + "</h1>" + r.getSheet_html())
                .collect(Collectors.joining("<!--PAGE_BREAK-->"));

        int updated = docMapper.updateTrans(docDto.toBuilder()
                .docStatus(TransStatus.SUCCESS.getDbCode())
                .transHtml(mergedHtml)
                .build());

        if (updated <= 0) {
            throw new Exception("문서 변환 결과 DB 업데이트 실패. docId: " + docDto.getDocId());
        }

        return TransStatus.SUCCESS.getMessage();
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



    /**
     * 서버 접속 URL 생성
     */
    private String buildApiUrl(String host, String port, String originalUrl)  {
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





    //전환 보류 상태 확인
    public void taskCheck(String apiUrlOcr) {

        List<DocDto> taskList = docMapper.getTaskList();

        for (DocDto docDto : taskList) {
            Long doc_id = Long.valueOf(docDto.getDocId());
            String taskId = docDto.getTransTaskid();
            log.info("doc_id:"+doc_id);

            try {
                String ocrHost = apiProps.getOcrHost();
                String ocrPort = apiProps.getOcrPort();

                apiUrlOcr = buildApiUrl(ocrHost, ocrPort, apiUrlOcr);
                WebClient webClient = createWebClient(apiUrlOcr);

                ApiTaskResponse taskResponse = getTaskStatus(webClient ,taskId);

                if (taskResponse.getStatus() != null && "SUCCESS".equalsIgnoreCase(taskResponse.getStatus())){
                    String toHtml = taskResponse.getResult().getOcr_gen().getHtml().get(0);
                    log.info("변환 성공 → DB 저장 중...");
                    docMapper.updateTrans(docDto.toBuilder()
                            .docStatus(TransStatus.SUCCESS.getDbCode())
                            .transHtml(toHtml)
                            .build());
                    log.info("DB 저장 완료!");
                } else if(taskResponse.getStatus() != null && "PENDING".equalsIgnoreCase(taskResponse.getStatus())) {
                    log.info("변환 대기중 입니다."+ taskResponse.getStatus());
//                String sql = "UPDATE tb_document SET DOC_STATUS = '3' ,TRANS_DT = NOW() WHERE DOC_ID = ?";
//                jdbcTemplate.update(sql, doc_id);
                } else {
                    docMapper.updateTrans(docDto.toBuilder()
                            .docStatus(TransStatus.FAILURE.getDbCode())
                            .build());
                }
            } catch (WebClientRequestException e) {
                log.error("taskId={} 상태 조회 중 통신 오류: {}", taskId, e.getMessage(), e);

                // 필요하다면 이 문서만 실패 상태로 전환
                docMapper.updateTrans(docDto.toBuilder()
                        .docStatus(TransStatus.FAILURE.getDbCode())
                        .build());
            }
        }
        log.info("taskCheck end");
    }

    public ApiTaskResponse getTaskStatus(WebClient webClient, String task_id) {
        log.info("getTaskStatus 시작");
        return webClient.get()
                .uri("/task/{id}", task_id)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(ApiTaskResponse.class)
                .block();
    }
}
