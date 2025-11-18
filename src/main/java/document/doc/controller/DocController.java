package document.doc.controller;

import document.doc.dto.DocDto;
import document.doc.service.DocService;
import document.user.dto.UserDto;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("doc")
public class DocController {

    private final DocService docService;

    @Description("문서 TB_DOC~ 리스트")
    @PostMapping("/list")
    public ResponseEntity<?> tbDocList(@RequestBody DocDto docDto) {
        return ResponseEntity.ok(docService.getDocList(docDto));
    }

    @Description("문서 등록")
    @PostMapping
    public ResponseEntity<?> uploadDoc(@ModelAttribute DocDto docDto,
                                       HttpSession session) throws Exception {
        UserDto userDto = (UserDto) session.getAttribute("loginUser");
        docService.saveDocument(docDto,userDto);
        return ResponseEntity.ok().build();
    }

    @Description("문서 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteDoc(@RequestBody DocDto docDto) throws Exception {
        docService.deleteDoc(docDto);
        return ResponseEntity.ok().build();
    }


    @Description("문서 변환")
    @PostMapping("/transfer")
    public ResponseEntity<?> transferDoc(@RequestBody DocDto docDto) throws Exception {
        String message = docService.apiTransfer(docDto);
        return ResponseEntity.ok(message);

    }

    @Description("문선 변환 후 html 가지고오기")
    @PostMapping("/transHtml")
    public ResponseEntity<?> transHtml(@RequestBody DocDto docDto) {
        return ResponseEntity.ok(docService.getTransHtml(docDto));
    }

}
