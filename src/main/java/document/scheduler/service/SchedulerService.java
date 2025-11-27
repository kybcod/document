package document.scheduler.service;

import document.config.TransDocApiProperties;
import document.config.TransServerProperties;
import document.doc.dto.*;
import document.doc.mapper.DocMapper;
import document.doc.service.DocService;
import io.netty.channel.ChannelOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final DocMapper docMapper;
    private final TransServerProperties servProp;
    private final TransDocApiProperties apiProps;
    private final DocService docService;

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

            try {

                docService.apiTransfer(docDto);
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
                log.info("taskResponse:"+taskResponse);

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
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        log.info("taskCheck end");
    }

    public ApiTaskResponse getTaskStatus(WebClient webClient, String task_id) {
        log.info("getTaskStatus 시작");
        log.info("task_id:"+task_id);
        return webClient.get()
                .uri("/task/{id}", task_id)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(ApiTaskResponse.class)
                .block();
    }
}