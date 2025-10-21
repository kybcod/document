package document.doc.controller;

import document.doc.dto.DocDto;
import document.doc.service.DocService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> insertDoc(@RequestBody DocDto docDto) {
        try {
            DocDto insertDocDto = docService.insertDoc(docDto);
            return ResponseEntity.ok(insertDocDto);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @Description("문서 삭제")
    @DeleteMapping
    public ResponseEntity<?> deleteDoc(@RequestBody DocDto docDto) {
        try {
            docService.deleteDoc(docDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }

    }

}
