package document.doc.service;

import document.doc.ServerInfoResolver;
import document.doc.dto.DocDto;
import document.doc.mapper.DocMapper;
import document.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocService {

    @Value("${file.upload.path}")
    private String uploadPath;

    private final DocMapper docMapper;
    private final ServerInfoResolver serverInfoResolver;

    /**
     * 문서 리스트
     */
    public List<DocDto> getDocList(DocDto docDto) {
        return docMapper.getDocList(docDto);
    }


    /**
     * 사용자 정보 삭제
     */
    public void deleteDoc(DocDto docDto) throws IOException {

        Path filePath = Paths.get(docDto.getDocFilepath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        docMapper.deleteDoc(docDto);
    }

    /**
     * 문서 등록
     */
    public void saveDocument(DocDto docDto, UserDto userDto) throws Exception {
        String serverNum = serverInfoResolver.resolveCurrentServerNumber();

        String orgFilename = docDto.getFile().getOriginalFilename(); // 예: "myDocument.pdf"
        String extension = orgFilename.substring(orgFilename.lastIndexOf(".")); // 확장자 추출
        String saveFilename = UUID.randomUUID().toString() +extension;

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        // uploadPath 디렉토리가 없으면 생성
        Path baseDir = Paths.get(uploadPath);
        if (!Files.exists(baseDir)) {
            Files.createDirectories(baseDir);
        }

        // 2날짜별 디렉토리 생성
        Path uploadDir = baseDir.resolve(today);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 실제 파일 저장 경로 (uploadPath + 파일명)
        Path filePath = uploadDir.resolve(saveFilename);
        Files.copy(docDto.getFile().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // DTO 구성
        DocDto insertDocDto = DocDto.builder()
                .docName(docDto.getDocName())
                .orgFilename(orgFilename)
                .saveFilename(saveFilename)
                .docFilepath(filePath.toString())
                .serverNum(serverNum)
                .ocryn(docDto.getOcryn())
                .crtId(userDto.getUserId())
                .build();


        docMapper.insertDoc(insertDocDto);
    }

    public void apiTransfer(DocDto docDto) {
        log.info("apiTransfer");

        // api 타고 변환 중일 떄는 1
        // 실패하면 docStatus 9
        // 성공하면 docStatus 2
    }
}
