package document.menu.dto;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Builder(toBuilder = true)
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MenuDto {

	@NotEmpty(message = "메뉴 ID")
	private String menuId;

	@NotEmpty(message = "메뉴 그룹")
	private String menuGroup;

	private String menuName;
	private String menuOrder;
	private String menuUrl;
	private String menuDesc;

	@NotEmpty(message = "메뉴 사용 유무")
	private String menuUse;

	private String crtId;
	private String crtDt;
	private String uptId;
	private String uptDt;

	private String permitId;

}
