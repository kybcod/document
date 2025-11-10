package document.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "servers")
@Getter @Setter
public class TransServerProperties {
	private String  server1;
    private String  server2;
    private String  type;
}
