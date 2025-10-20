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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
                .uptDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .build();

        int updateMenuInfo = menuMapper.updateMenuInfo(updateMenuDto);

        if (updateMenuInfo > 0 ) {
            return menuMapper.getMenuByMenuId(updateMenuDto.getMenuId()).get(0);
        }
        return null;
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
                .crtDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .uptId(userDto.getUserId())
                .uptDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .build();


        int insertUserInfo = menuMapper.insertMenuInfo(insertMenuDto);

        // 관리자 insert
        MenuAuthDto menuAuthDto = MenuAuthDto.builder()
                .permitId(userDto.getPermitId()) // FIXME: 관리자 일 때만?
                .menuId(insertMenuDto.getMenuId())
                .crtId(userDto.getUserId())
                .crtDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .uptId(userDto.getUserId())
                .uptDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .build();

        //menuAuthMapper.insertAdmPermitDetail(menuAuthDto);

        if (insertUserInfo > 0) {
            return menuMapper.getMenuByMenuId(menuDto.getMenuId()).get(0);
        }

        return null;
    }


    /**
     * 메뉴 삭제
     * */
    @Transactional(rollbackFor = Exception.class)
    public void deleteMenuInfo(MenuDto menuDto) {

        // 무조건 자기 자신 삭제
        menuMapper.deleteMenuById(menuDto.getMenuId());

        // 상위 메뉴가 삭제 시 하위 메뉴들도 삭제
        if ("0000".equals(menuDto.getMenuGroup())) {
            List<MenuDto> childIds = menuMapper.findChildren(menuDto.getMenuId());
            for (MenuDto childId : childIds) {
                menuMapper.deleteMenuById(childId.getMenuId());
            }
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
        List<MenuDto> parentMenu = menuMapper.getMenuByMenuId(menuDto.getMenuGroup());

        if ("0000".equals(menuDto.getMenuGroup())) {
            List<MenuDto> parentMenuList = menuMapper.getMenuByMenuGroup("0000");
            MenuDto parentMenus = parentMenuList.get(0);
            newMenuOrder = Integer.valueOf(parentMenus.getMenuOrder()) + 1;
        } else {

            // 부모 아이디로 해당 자식 메뉴 있는지 먼저 조회
            if (parentMenu != null && !parentMenu.isEmpty()) {
                // 부모의 가장 마지막 하위 자식 리스트를 가져와야 함
                List<MenuDto> parentMenuList = menuMapper.getMenuByMenuGroup(menuDto.getMenuGroup());
                MenuDto parentMenus = parentMenuList.get(0);
                newMenuOrder = Integer.valueOf(parentMenus.getMenuOrder()) + 1;
            } else {
                newMenuOrder = 1;
            }
        }
        return newMenuOrder;
    }
}
