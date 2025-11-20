package document.menu.controller;

import document.menu.dto.MenuDto;
import document.menu.dto.UseMenuDto;
import document.menu.service.MenuService;
import document.user.dto.UserDto;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("menu")
@Validated
public class MenuController {

    private final MenuService menuService;

	@Description("동적 탭 메뉴")
	@PostMapping("/activeList")
	public ResponseEntity<?> activeList(MenuDto menuDto, HttpSession session) {
		UserDto userDto = (UserDto) session.getAttribute("loginUser");
		return ResponseEntity.ok(menuService.getActiveMenuList(menuDto, userDto));
	}


    @Description("메뉴 관리 리스트")
    @PostMapping("/list")
    public ResponseEntity<?> menuList(MenuDto menuDto) {
        return ResponseEntity.ok(menuService.getMenuList(menuDto));
    }

    
    @Description("메뉴 관리 수정")
    @PutMapping
    public ResponseEntity<?> updateMenuInfo(@Valid @RequestBody MenuDto menuDto, HttpSession session) throws Exception {
        UserDto userDto = (UserDto) session.getAttribute("loginUser");

        MenuDto updatedUserInfo = menuService.updateMenuInfo(menuDto, userDto);
        return ResponseEntity.ok(updatedUserInfo);

    }

    @Description("메뉴 관리 등록")
    @PostMapping
    public ResponseEntity<?> insertMenuInfo(@Valid @RequestBody MenuDto menuDto, HttpSession session) throws Exception {
            UserDto userDto = (UserDto) session.getAttribute("loginUser");
            MenuDto insertMenuDto = menuService.insertMenuInfo(menuDto, userDto);
            return ResponseEntity.ok(insertMenuDto);
    }

    @Description("메뉴 관리 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteMenuInfo(@RequestBody MenuDto menuDto) throws Exception {
            menuService.deleteMenuInfo(menuDto);
            return ResponseEntity.ok().build();
    }


    @Description("사용 중인 메뉴 리스트")
    @PostMapping("/useList")
    public ResponseEntity<?> menuUseList(@RequestBody UseMenuDto menuDto) {
        return ResponseEntity.ok(menuService.menuUseList(menuDto));
    }
}
