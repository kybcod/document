package document.menu.service;

import document.menu.dto.MenuAuthDto;
import document.menu.dto.MenuDto;
import document.menu.dto.UseMenuDto;
import document.menu.mapper.MenuAuthMapper;
import document.menu.mapper.MenuMapper;
import document.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuMapper menuMapper;
    private final MenuAuthMapper menuAuthMapper;


    /**
     * 사이드 메뉴 가져오기
     * */
	public List<MenuDto> getActiveMenuList(MenuDto menuDto, UserDto userDto) {

        MenuDto newMenuDto = menuDto.toBuilder()
                .permitId(userDto.getPermitId())
                .build();

		return menuMapper.getActiveMenuList(newMenuDto);
	}

    /**
     * 메뉴 리스트 가져오기
     * */
    public List<MenuDto> getMenuList(MenuDto menuDto) {
        return menuMapper.getMenuList(menuDto);
    }

    /**
     * 메뉴 업데이트
     * */
    public MenuDto updateMenuInfo(MenuDto menuDto, UserDto userDto) throws Exception {

        MenuDto updateMenuDto = menuDto.toBuilder()
                .uptId(userDto.getUserId())
                .build();

        int updateMenuInfo = menuMapper.updateMenuInfo(updateMenuDto);

        if (updateMenuInfo <= 0 ) {
            throw new Exception("메뉴 업데이트에 실패했습니다.");
        }

        return menuMapper.getMenuByMenuId(updateMenuDto.getMenuId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new Exception("메뉴 정보를 가져올 수 없습니다."));
    }

    /**
     * 메뉴 추가
     * */
    public MenuDto insertMenuInfo(MenuDto menuDto, UserDto userDto) throws Exception {

        List<MenuDto> existingMenuId = menuMapper.getMenuByMenuId(menuDto.getMenuId());
        if (existingMenuId != null && !existingMenuId.isEmpty()) {
            throw new Exception("이미 존재하는 메뉴 아이디입니다.");
        }

        int newMenuOrder = getNewMenuOrder(menuDto);

        MenuDto insertMenuDto = menuDto.toBuilder()
                .menuId(menuDto.getMenuId())
                .menuOrder(String.valueOf(newMenuOrder))
                .crtId(userDto.getUserId())
                .uptId(userDto.getUserId())
                .build();


        int insertUserInfo = menuMapper.insertMenuInfo(insertMenuDto);

        // 관리자 insert
        MenuAuthDto menuAuthDto = MenuAuthDto.builder()
                .permitId(userDto.getPermitId()) // FIXME: 관리자 일 때만?
                .menuId(insertMenuDto.getMenuId())
                .crtId(userDto.getUserId())
                .uptId(userDto.getUserId())
                .build();

        menuAuthMapper.insertTbPermitDetail(menuAuthDto);

        if (insertUserInfo <= 0) {
            throw new Exception("메뉴 추가에 실패했습니다.");
        }

        return menuMapper.getMenuByMenuId(menuDto.getMenuId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new Exception("메뉴 조회에 실패했습니다."));
    }


    /**
     * 메뉴 삭제
     * */
    @Transactional(rollbackFor = Exception.class)
    public void deleteMenuInfo(MenuDto menuDto) throws Exception {

        int deleted = menuMapper.deleteMenuById(menuDto.getMenuId());
        if (deleted == 0) {
            throw new Exception("삭제할 메뉴가 존재하지 않습니다.");
        }

        if ("0000".equals(menuDto.getMenuGroup())) {
            List<MenuDto> childIds = menuMapper.findChildren(menuDto.getMenuId());
            for (MenuDto childId : childIds) {
                menuMapper.deleteMenuById(childId.getMenuId());
            }
        }

        MenuAuthDto menuAuthDto = MenuAuthDto.builder()
                .menuId(menuDto.getMenuId())
                .build();

        int authDeleted = menuAuthMapper.deleteTbPermitDByMenuId(menuAuthDto);
        if (authDeleted == 0) {
            throw new Exception("권한 삭제에 실패했습니다.");
        }
    }


    /**
     * 사용 중인 메뉴 리스트
     * */
    public List<UseMenuDto> menuUseList(UseMenuDto menuDto){
        return menuMapper.getMenuWithPermitFlag(menuDto);
    }


    /**
     * 메뉴 순서
     * */
    private int getNewMenuOrder(MenuDto menuDto) {

        int newMenuOrder = 1;

        // 부모는 0000에 따라 menuOrder + 1
        if ("0000".equals(menuDto.getMenuGroup())) {
            List<MenuDto> parentMenuList = menuMapper.getMenuByMenuGroup("0000");
            MenuDto parentMenus = parentMenuList.get(0);
            newMenuOrder = Integer.valueOf(parentMenus.getMenuOrder()) + 1;
        } else {
            // 자식은 : 처음인 자식은 1, 그 다음 자식은 가장 마지막에 들어온 자식의 + 1

            // 자식이 있는지 없는지 확인(메뉴 그룹으로 조회)
            List<MenuDto> parentMenuList = menuMapper.getMenuByMenuGroup(menuDto.getMenuGroup());
            if (parentMenuList != null && !parentMenuList.isEmpty()) {

                // 부모의 가장 마지막 하위 자식 리스트를 가져와야 함
                MenuDto parentMenus = parentMenuList.get(0);
                newMenuOrder = Integer.valueOf(parentMenus.getMenuOrder()) + 1;

            } else {
                newMenuOrder = 1;
            }
        }
        return newMenuOrder;
    }
}
