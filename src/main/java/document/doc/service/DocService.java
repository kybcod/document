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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public void deleteDoc(DocDto docDto) {
        docMapper.deleteDoc(docDto);
    }

    /**
     * 문서 등록
     */
    public void saveDocument(String docName, MultipartFile file, UserDto userDto) throws Exception {
        String serverNum = serverInfoResolver.resolveCurrentServerNumber();

        String orgFilename = file.getOriginalFilename(); // 예: "myDocument.pdf"
        String extension = orgFilename.substring(orgFilename.lastIndexOf(".")); // 확장자 추출
        String saveFilename = UUID.randomUUID().toString() +extension;

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));


        // 파일 저장 경로 생성 확인 (예: ./uploads/2025-10-21)
        Path uploadDir = Paths.get(uploadPath, today);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 실제 파일 저장 경로 (uploadPath + 파일명)
        Path filePath = uploadDir.resolve(saveFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // DTO 구성
        DocDto docDto = DocDto.builder()
                .docName(docName)
                .orgFilename(orgFilename)
                .saveFilename(saveFilename)
                .docFilepath(filePath.toString())
                .serverNum(serverNum)
                .crtId(userDto.getUserId())
                .build();

        docMapper.insertDoc(docDto);
    }

}
