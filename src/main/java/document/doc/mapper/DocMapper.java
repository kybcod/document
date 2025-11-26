package document.doc.mapper;

import document.doc.dto.DocDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DocMapper {
    List<DocDto> getDocList(DocDto docDto);

    int deleteDoc(DocDto docDto);

    DocDto getDocrByDocId(DocDto docDto);

    int insertDoc(DocDto docDto);

    int updateTrans(DocDto docDto);

    int getDocCountByStatus(String docStatus);

    List<DocDto> getDocListByServer(String serverNum);

    List<DocDto> getTaskList();
}
