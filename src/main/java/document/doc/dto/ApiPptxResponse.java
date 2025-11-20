package document.doc.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ApiPptxResponse extends ApiResponseBase{
    public String full_html;

    @Override
    public String getHtmlContent() {
        return full_html;
    }
}
