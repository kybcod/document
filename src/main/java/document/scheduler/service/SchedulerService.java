package document.scheduler.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    public void connection() {
      log.info("스케줄링 테스트 합니다.");
    }
}
