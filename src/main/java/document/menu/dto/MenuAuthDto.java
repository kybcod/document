package document.menu.dto;

import lombok.*;

@Getter
@Builder(toBuilder = true)
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MenuAuthDto {
    private String permitId;
    private String permitName;
    private String permitDesc;
    private String crtId;
    private String crtDt;
    private String uptId;
    private String uptDt;

    private String menuId;
	private String menuName;
	private String menuGroup;
}
