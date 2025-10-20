package hello.document.exception;

import hello.document.user.dto.LoginStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginException extends RuntimeException {
    private final LoginStatus status;
    private String userId;

    public LoginException(LoginStatus status) {
        this.status = status;
    }

}
