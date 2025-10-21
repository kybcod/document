package document.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@RequiredArgsConstructor
@Slf4j
@Controller
public class MappingController {

    /****************************** 로그인 ******************************/
    @GetMapping("login")
    public String login() {
        return "login/login";
    }

    /****************************** 로그아웃 ******************************/
    @Description("로그아웃")
    @GetMapping("logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }

    /****************************** 메인페이지 ******************************/
    @GetMapping("/")
    public String main() {return "main";}


    /****************************** 사용자 설정 ******************************/
    @GetMapping("user_info/list")
    public String user_info() {return "userInfo/user_info";}

    @GetMapping("user_info/menu")
    public String menu_info() {return "userInfo/menu_info";}

    @GetMapping("user_info/menu_auth")
    public String menu_auth() {return "userInfo/menu_auth";}

    /****************************** 문서 변환 ******************************/
    @GetMapping("doc_trans/doc_insert")
    public String doc_insert() {return "docTrans/doc_insert";}

}
