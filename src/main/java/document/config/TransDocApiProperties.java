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
	private String  docx;
	private String  ocr;
	private String docxHost;
	private String docxPort;
	private String ocrHost;
	private String ocrPort;
	private String hwp;
	private String hwpHost;
	private String hwpPort;
}
