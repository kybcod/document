package document.doc;

import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Map;

@Component
public class ServerInfoResolver {

    private final Map<String, Object> serverConfig;

    public ServerInfoResolver() {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("server.yml")) {
            Yaml yaml = new Yaml();
            serverConfig = yaml.load(in);
        } catch (Exception e) {
            throw new RuntimeException("server.yml 로드 실패", e);
        }
    }

    public String resolveCurrentServerNumber() {
        try {
            String currentIp = InetAddress.getLocalHost().getHostAddress();

            @SuppressWarnings("unchecked")
            Map<String, String> servers = (Map<String, String>) serverConfig.get("servers");

            String server2Ip = servers.get("server2");
            if (server2Ip != null && server2Ip.equals(currentIp)) {
                return "2";
            } else {
                return "1"; // 기본은 1번
            }
        } catch (UnknownHostException e) {
            return "1"; // 오류 시 기본값
        }
    }
}
