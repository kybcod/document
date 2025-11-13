package document.doc.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter
@Builder(toBuilder = true)
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class DocDto {

    private String docId; // 파일아이디
    private String docDt; // 파일 등록 날짜
    private String docName; // 문서 이름
    private String orgFilename; // 원본파일명
    private String saveFilename; // 저장파일명
    private String docFilepath; // 저장경로
    private String docStatus; // 문서 상태
    private String serverNum; //서버번호
    private String ocryn; //orc로 변환
    private String crtId;
    private String crtDt;
    private String transFile; //변환파일
    private String transDt; //변환파일작업일시
    private String transHtml; //변환파일html
    private String transTaskid; //ocr task id (pdf, img 변한 시 필요)

    private String startDate; //시작날짜
    private String endDate; //종료날짜

    private MultipartFile file; //파일


}
