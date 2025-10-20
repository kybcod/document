package document.user.dto;

import lombok.*;

@Getter
@Builder(toBuilder = true)
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private String userId;
    private String userName;
    private String userPass;
    private String userEmail;
    private String userTel;
    private String pwdFcnt;
    private String permitId;
    private String userFlag;
    private String crtId;
    private String crtDt;
    private String uptId;
    private String uptDt;

}
