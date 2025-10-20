package document.menu.dto;

import lombok.*;

@Getter
@Builder(toBuilder = true)
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MenuDto {

    private String menuId;
	private String menuName;
	private String menuGroup;
	private String menuOrder;
	private String menuUrl;
	private String menuDesc;
	private String menuUse;
	private String crtId;
	private String crtDt;
	private String uptId;
	private String uptDt;

	private String permitId;

}
