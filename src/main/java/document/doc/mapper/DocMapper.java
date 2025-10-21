package document.doc.mapper;

import document.doc.dto.DocDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DocMapper {
    List<DocDto> getDocList(DocDto docDto);

    void deleteDoc(DocDto docDto);

    DocDto getDocrByDocId(String docId);

    int insertDoc(DocDto docDto);
}
