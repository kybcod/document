package document.doc.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiXlsxResponse extends ApiResponseBase{
    public String sheet_html;
    public String sheet_name;
    public int sheet_no;

    @Override
    public String getHtmlContent() { return sheet_html; }
}
