package document.doc.dto;

public class ApiDocxResponse extends ApiResponseBase {
    public String file_name;
    public String[] messages;

    @Override
    public String getErrorMessage() {
        if (messages != null && messages.length > 0) {
            return String.join(", ", messages);
        }
        return null;
    }
}
