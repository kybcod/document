package document.menu.controller;

import document.menu.dto.MenuAuthDto;
import document.menu.dto.UseMenuDto;
import document.menu.service.MenuAuthService;
import document.user.dto.UserDto;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("menu-auth")
public class MenuAuthController {

    private final MenuAuthService menuAuthService;

    @Description("메뉴 권한 관리 리스트")
    @PostMapping("/mgmtList")
    public ResponseEntity<?> menuMgmtList(MenuAuthDto menuAuthDto) {
        return ResponseEntity.ok(menuAuthService.getMenuMgmtList(menuAuthDto));
    }

    @Description("메뉴 권한 관리 수정")
    @PutMapping
    public ResponseEntity<?> updateMenuAuthInfo(@RequestBody MenuAuthDto menuAuthDto, HttpSession session) {
        try {
            UserDto userDto = (UserDto) session.getAttribute("loginUser");
            MenuAuthDto updateMenuAuthDto = menuAuthService.updateMenuAuthInfo(menuAuthDto, userDto);
            return ResponseEntity.ok(updateMenuAuthDto);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }

    }

    @Description("메뉴 권한 관리 등록")
    @PostMapping
    public ResponseEntity<?> insertMenuAuthInfo(@RequestBody MenuAuthDto menuAuthDto, HttpSession session) {
        try {
            UserDto userDto = (UserDto) session.getAttribute("loginUser");
            MenuAuthDto insertMenuAuthDto = menuAuthService.insertMenuAuthInfo(menuAuthDto,userDto);
            return ResponseEntity.ok(insertMenuAuthDto);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @Description("메뉴 권한 관리 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteMenuAuthInfo(@RequestBody MenuAuthDto menuAuthDto) {
        try {
            menuAuthService.deleteMenuAuthInfo(menuAuthDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }

    }


    @Description("메뉴 권한 등록 리스트")
    @PostMapping("/insertList")
    public ResponseEntity<?> getMenuInsertListByPermitId(@RequestBody MenuAuthDto menuAuthDto) {
        return ResponseEntity.ok(menuAuthService.getMenuInsertListByPermitId(menuAuthDto));
    }

    @Description("메뉴 권한 관리 삭제")
    @PostMapping("/permitDetailDelete")
    public ResponseEntity<?> deletePermitDetail(@RequestBody MenuAuthDto menuAuthDto) {
        try {
            menuAuthService.deletePermitDetail(menuAuthDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }

    }

    @Description("권한 아이디 마다 메뉴 사용 여부 결정")
    @PostMapping("/menuUseinsert")
    public ResponseEntity<?> insertMenuAuthUse(@RequestBody List<UseMenuDto> menuList, HttpSession session) {
        try {
            UserDto userDto = (UserDto) session.getAttribute("loginUser");
            menuAuthService.insertMenuAuthUse(menuList, userDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

}
