package document.user.controller;

import document.user.dto.UserDto;
import document.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("user")
public class UserController {

    private final UserService userService;

    @Description("사용자 관리 User 리스트")
    @PostMapping("/list")
    public ResponseEntity<?> userList(UserDto userDto) {
        return ResponseEntity.ok(userService.getUserList(userDto));
    }

    @Description("해당 User 리스트")
    @PostMapping("/userId")
    public ResponseEntity<?> byUerIdList(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.getUserListByUserId(userDto));
    }

    @Description("사용자 관리 메뉴 권한 리스트")
    @PostMapping("/menu-role/list")
    public ResponseEntity<?> UserList(UserDto userDto) {
        return ResponseEntity.ok(userService.getMenuRoleList(userDto));
    }

    @Description("사용자 관리 User 수정")
    @PutMapping
    public ResponseEntity<?> updateUserList(@RequestBody UserDto userDto) throws Exception {
        UserDto updatedUserInfo = userService.updateUserInfo(userDto);
        return ResponseEntity.ok(updatedUserInfo);

    }

    @Description("사용자 관리 User 등록")
    @PostMapping
    public ResponseEntity<?> insertUserInfo(@RequestBody UserDto userDto) throws Exception {
        UserDto insertUserDto = userService.insertUserInfo(userDto);
        return ResponseEntity.ok(insertUserDto);
    }

    @Description("사용자 관리 User 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteUserInfo(@RequestBody UserDto userDto) throws Exception {
        userService.deleteUserInfo(userDto);
        return ResponseEntity.ok().build();

    }

    @Description("로그인 체크")
    @PostMapping("/loginck")
    public ResponseEntity<?> loginck(@RequestBody UserDto userDto, HttpSession session) throws Exception {
        UserDto loginUser = userService.login(userDto);
        session.setAttribute("loginUser", loginUser);
        session.setMaxInactiveInterval(10 * 60 * 6 * 13);// 세션 설정
        return ResponseEntity.ok(loginUser);
    }

    @Description("암호 변경")
    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody UserDto userDto) throws Exception {
        UserDto changeUser = userService.changePassword(userDto);
        return ResponseEntity.ok(changeUser);
    }



    @Description("실패 횟수 리셋")
    @PutMapping("/updatePwdFcntZero")
    public ResponseEntity<?> updatePwdFcntZero(@RequestBody UserDto userDto) throws Exception {
         userService.updatePwdFcntZero(userDto);
        return ResponseEntity.ok().build();

    }


}
