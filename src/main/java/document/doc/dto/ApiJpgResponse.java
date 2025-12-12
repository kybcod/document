package document.doc.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiJpgResponse extends ApiResponseBase{
    public String filename;
    public String image_base64;
}
