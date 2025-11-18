package document.menu.mapper;

import document.menu.dto.MenuDto;
import document.menu.dto.UseMenuDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MenuMapper {
    List<MenuDto> getActiveMenuList(MenuDto menuDto);
    List<MenuDto> getMenuList(MenuDto menuDto);
    List<MenuDto> getMenuByMenuId(String menuId);
    int updateMenuInfo(MenuDto menuDto);
    int insertMenuInfo(MenuDto menuDto);
    int deleteMenuById(String menuId);
    List<MenuDto> findChildren(String menuId);
    List<MenuDto> getMenuByMenuGroup(String menuGroup);
    List<UseMenuDto> getMenuWithPermitFlag(UseMenuDto menuDto);
}
