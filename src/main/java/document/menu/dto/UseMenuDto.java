package document.menu.dto;

import lombok.*;

@Getter
@Builder(toBuilder = true)
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UseMenuDto {

    private String menuId;
	private String permitId;
	private String menuName;
	private String menuGroup;
	private String menuUse;
	private String realUse;

	private String crtId;
	private String crtDt;
	private String uptId;
	private String uptDt;
}
