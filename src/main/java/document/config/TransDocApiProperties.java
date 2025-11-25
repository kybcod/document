package document.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "api.url")
@Getter
@Setter
public class TransDocApiProperties {
	private String docx;
	private String docxHost;
	private String docxPort;
	private String ocr;
	private String ocrHost;
	private String ocrPort;
	private String hwp;
	private String hwpHost;
	private String hwpPort;
	private String pptx;
	private String pptxHost;
	private String pptxPort;
    private String xlsx;
    private String xlsxHost;
    private String xlsxPort;
}
