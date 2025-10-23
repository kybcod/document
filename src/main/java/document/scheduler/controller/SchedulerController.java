package document.scheduler.controller;

import document.scheduler.service.SchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchedulerController
{
    private final SchedulerService schedulerService;

    @Value("${scheduler.enable}")
    private boolean schedulerEnable;

    @Scheduled(cron  = "${scheduler.cron}")
    public void scheduler() throws Exception {
        if (!schedulerEnable) {
            return;
        }
        schedulerService.connection();
    }
}