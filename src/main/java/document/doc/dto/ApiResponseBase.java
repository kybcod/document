package document.doc.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponseBase {
    public String status;
    public String html_content;

    public String getErrorMessage() {
        return null;
    }
}
