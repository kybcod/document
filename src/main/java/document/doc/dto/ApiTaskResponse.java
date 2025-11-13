package document.doc.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
public class ApiTaskResponse extends ApiResponseBase{

    public Result result;

    @Getter
    @Setter
    public static class Result{
        private String conv_type;
        private OcrGen ocr_gen;
    }

    @Getter
    @Setter
    public static class OcrGen{
        private List<String> page_no;
        private List<String> ocr_md;
        private List<String> base64_image;
        private List<String> html;
    }
}
