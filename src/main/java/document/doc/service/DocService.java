package document.doc.service;

import document.doc.dto.DocDto;
import document.doc.mapper.DocMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocService {


    private final DocMapper docMapper;

    /**
     * 문서 리스트
     */
    public List<DocDto> getDocList(DocDto docDto) {
        return docMapper.getDocList(docDto);
    }


    /**
     * 문서 추가
     */
    public DocDto insertDoc(DocDto docDto) throws Exception {

        DocDto existingUserId = docMapper.getDocrByDocId(docDto.getDocId());

        if (existingUserId != null) {
            throw new Exception("이미 존재하는 문서 아이디입니다.");
        }

        int insertUserInfo = docMapper.insertDoc(docDto);

        if (insertUserInfo > 0) {
            return docMapper.getDocrByDocId(docDto.getDocId());
        }
        return null;
    }


    /**
     * 사용자 정보 삭제
     */
    public void deleteDoc(DocDto docDto) {
        docMapper.deleteDoc(docDto);
    }

    
    
}
