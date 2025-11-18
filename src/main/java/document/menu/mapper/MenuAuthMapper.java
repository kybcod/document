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
    int deleteMenuAuthInfo(MenuAuthDto menuAuthDto);
    int deletePermitDetail(MenuAuthDto menuAuthDto);
    int insertTbPermitDetail(MenuAuthDto menuAuthDto);

    int deleteTbPermitDByMenuId(MenuAuthDto menuAuthDto);
}
