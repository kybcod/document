package document.doc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TransStatus {

    SUCCESS("2", "변환 성공했습니다.", "SUCCESS"),
    PENDING("3", "변환 대기중입니다.", "PENDING"),
    FAILURE("9", "변환 중 문제가 발생했습니다.", null);

    private final String dbCode;
    private final String message;
    private final String apiStatus;

    /**
     * API 상태 문자열을 기반으로 ENUM을 찾습니다.
     */
    public static TransStatus fromApiStatus(String apiStatus) {
        if (apiStatus == null) {
            return FAILURE;
        }

        for (TransStatus status : values()) {
            if (apiStatus.equalsIgnoreCase(status.getApiStatus())) {
                return status;
            }
        }

        return FAILURE;
    }
}
