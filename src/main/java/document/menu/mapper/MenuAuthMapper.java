package document.menu.mapper;

import document.menu.dto.MenuAuthDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MenuAuthMapper {
    List<MenuAuthDto> getMenuMgmtList(MenuAuthDto menuAuthDto);
    List<MenuAuthDto> getMenuInsertListByPermitId(MenuAuthDto menuAuthDto);
    int updateMenuAuthInfo(MenuAuthDto menuAuthDto);
    int insertMenuAuthInfo(MenuAuthDto menuAuthDto);
    MenuAuthDto getMenuMgmtByPermitId(MenuAuthDto updateMenuAuthDto);
    void deleteMenuAuthInfo(MenuAuthDto menuAuthDto);
    void deletePermitDetail(MenuAuthDto menuAuthDto);
    void insertTbPermitDetail(MenuAuthDto menuAuthDto);

    void deleteTbPermitDByMenuId(MenuAuthDto menuAuthDto);
}
