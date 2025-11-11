package document.doc.dto;

public class ApiHwpResponse extends ApiResponseBase {
    public String filename;
    public ErrorDetail error;

    public static class ErrorDetail {
        public String code;
        public String message;
        public String details;
    }

    @Override
    public String getErrorMessage() {
        if (error != null && error.message != null) {
            return error.message;
        }
        return null;
    }
}
