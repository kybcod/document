package document.menu.service;

import document.menu.dto.MenuAuthDto;
import document.menu.dto.UseMenuDto;
import document.menu.mapper.MenuAuthMapper;
import document.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuAuthService {

    private final MenuAuthMapper menuAuthMapper;

    /**
     * 메뉴 권한 리스트 가져오기
     * */
    public List<MenuAuthDto> getMenuMgmtList(MenuAuthDto menuAuthDto) {
        return menuAuthMapper.getMenuMgmtList(menuAuthDto);
    }

    /**
     * 메뉴 권한 수정
     * */
    public MenuAuthDto updateMenuAuthInfo(MenuAuthDto menuAuthDto, UserDto userDto) {

        MenuAuthDto updateMenuAuthDto = menuAuthDto.toBuilder()
                .uptId(userDto.getUserId())
                .uptDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .build();

        int updated = menuAuthMapper.updateMenuAuthInfo(updateMenuAuthDto);

        if (updated > 0) {
            return menuAuthMapper.getMenuMgmtByPermitId(updateMenuAuthDto);
        }

        return null;
    }


    /**
     * 메뉴 권한 등록
     * */
    public MenuAuthDto insertMenuAuthInfo(MenuAuthDto menuAuthDto, UserDto userDto) throws Exception {

        MenuAuthDto exisingPermitId = menuAuthMapper.getMenuMgmtByPermitId(menuAuthDto);

        if (exisingPermitId != null) {
            throw new Exception("이미 존재하는 권한 아이디입니다.");
        }


        MenuAuthDto insertMenuAuthDto = menuAuthDto.toBuilder()
                .crtId(userDto.getUserId())
                .crtDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .uptId(userDto.getUserId())
                .uptDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                .build();

        int inserted = menuAuthMapper.insertMenuAuthInfo(insertMenuAuthDto);

        if (inserted > 0) {
            return menuAuthMapper.getMenuMgmtByPermitId(insertMenuAuthDto);
        }

        return null;
    }


    /**
     * 메뉴 권한 삭제
     * */
    public void deleteMenuAuthInfo(MenuAuthDto menuAuthDto) {
        menuAuthMapper.deleteMenuAuthInfo(menuAuthDto);
    }


    /**
     * 메뉴 권한 등록 리스트 가져오기
     * */

    public List<MenuAuthDto> getMenuInsertListByPermitId(MenuAuthDto menuAuthDto) {
        return menuAuthMapper.getMenuInsertListByPermitId(menuAuthDto);
    }

    /**
     * 메뉴 권한 등록 리스트 삭제
     * */
    public void deletePermitDetail(MenuAuthDto menuAuthDto) {
        menuAuthMapper.deletePermitDetail(menuAuthDto);
    }


    /**
     * 메뉴 사용 여부 결정
     * */
    public void insertMenuAuthUse(List<UseMenuDto> menuList, UserDto userDto) {

        String permitId = menuList.get(0).getPermitId();

        // 해당 권한 아이디에 대한 메뉴 전체 조회
        List<MenuAuthDto> existingMenu = menuAuthMapper.getMenuInsertListByPermitId(
                MenuAuthDto.builder().permitId(permitId).build()
        );

        // DB에 존재하는 menuId set 생성
        Set<String> existingMenuIds = existingMenu.stream()
                .map(MenuAuthDto::getMenuId)
                .collect(Collectors.toSet());

        for (UseMenuDto menu : menuList) {

            boolean exist = existingMenuIds.contains(menu.getMenuId());

            MenuAuthDto menuAuthDto = MenuAuthDto.builder()
                    .permitId(menu.getPermitId())
                    .menuId(menu.getMenuId())
                    .crtId(userDto.getUserId())
                    .crtDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                    .uptId(userDto.getUserId())
                    .uptDt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))
                    .build();

            // menuId가 DB에 존재하고 realUse=0 → 삭제
            if (exist && "0".equals(menu.getRealUse())) {
                menuAuthMapper.deletePermitDetail(menuAuthDto);
            }

            // menuId가 DB에 없고고 realUse=1 → 추가
            if (!exist && "1".equals(menu.getRealUse())) {
                menuAuthMapper.insertAdmPermitDetail(menuAuthDto);
            }
        }
    }

}
