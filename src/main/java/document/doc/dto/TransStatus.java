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

    /**
     * API 응답 객체 받아와 ENUM 찾기
     * - ApiPptxResponse: full_html 필드 존재 여부로 SUCCESS/FAILURE 판단.
     * - 그 외: status 필드를 기준으로 판단.
     */
    public static TransStatus fromApiResponse(ApiResponseBase response) {
        if (response instanceof ApiPptxResponse) {
            ApiPptxResponse pptxResponse = (ApiPptxResponse) response;
            // PPTX 응답 객체의 경우: full_html 값이 유효하면 SUCCESS
            if (pptxResponse.getFull_html() != null && !pptxResponse.getFull_html().trim().isEmpty()) {
                return SUCCESS;
            } else {
                return FAILURE;
            }
        }

        // PPTX 외 다른 응답 객체의 경우: status 필드를 사용하여 판단 (기존 API 방식)
        return fromApiStatus(response.status);
    }
}
