package document.doc.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class ApiResponseBase {
    public String status;
    public String html_content;

    public String getErrorMessage() {
        return null;
    }

    public String getHtmlContent() {
        return html_content;
    }

}
