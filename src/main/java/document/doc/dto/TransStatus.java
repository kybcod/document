package document.doc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TransStatus {

    SUCCESS("2", "변환 성공했습니다.", "SUCCESS"),
    PENDING("3", "변환 대기중입니다.", "PENDING"),
    FAILURE("9", "변환 중 문제가 발생했습니다.", null),
    NOFILE("8", "변환할 파일이 존재하지 않습니다: ", null);

    private final String dbCode;
    private final String message;
    private final String apiStatus;

    public String getMsgFilePath(String filePath) {
        return message + filePath;
    }

    /**
     * API 상태 문자열 받아와 ENUM 찾기
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
