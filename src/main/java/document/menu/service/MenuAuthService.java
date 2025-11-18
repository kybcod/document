package document.menu.service;

import document.menu.dto.MenuAuthDto;
import document.menu.dto.UseMenuDto;
import document.menu.mapper.MenuAuthMapper;
import document.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public MenuAuthDto updateMenuAuthInfo(MenuAuthDto menuAuthDto, UserDto userDto) throws Exception {

        MenuAuthDto updateMenuAuthDto = menuAuthDto.toBuilder()
                .uptId(userDto.getUserId())
                .build();

        int updated = menuAuthMapper.updateMenuAuthInfo(updateMenuAuthDto);

        if (updated <= 0) {
            throw new Exception("메뉴 권한 업데이트에 실패했습니다.");
        }


        return menuAuthMapper.getMenuMgmtByPermitId(updateMenuAuthDto);
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
                .uptId(userDto.getUserId())
                .build();

        int inserted = menuAuthMapper.insertMenuAuthInfo(insertMenuAuthDto);

        if (inserted <= 0) {
            throw new Exception("메뉴 권한 등록에 실패했습니다.");
        }

        MenuAuthDto result = menuAuthMapper.getMenuMgmtByPermitId(insertMenuAuthDto);

        if (result == null) {
            throw new Exception("등록된 메뉴 권한 정보를 조회할 수 없습니다.");
        }

        return result;
    }


    /**
     * 메뉴 권한 삭제
     * */
    public void deleteMenuAuthInfo(MenuAuthDto menuAuthDto) throws Exception {
        int deleted = menuAuthMapper.deleteMenuAuthInfo(menuAuthDto);

        if (deleted <= 0) {
            throw new Exception("메뉴 권한 삭제에 실패했습니다.");
        }
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
    public void deletePermitDetail(MenuAuthDto menuAuthDto) throws Exception {
        int deleted = menuAuthMapper.deletePermitDetail(menuAuthDto);

        if (deleted <= 0) {
            throw new Exception("메뉴 권한 상세 삭제에 실패했습니다.");
        }
    }


    /**
     * 메뉴 사용 여부 결정
     * */
    @Transactional(rollbackFor = Exception.class)
    public void insertMenuAuthUse(List<UseMenuDto> menuList, UserDto userDto) throws Exception {

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
                    .uptId(userDto.getUserId())
                    .build();

            // menuId가 DB에 존재하고 realUse=0 → 삭제
            if (exist && "0".equals(menu.getRealUse())) {
                int deleted = menuAuthMapper.deletePermitDetail(menuAuthDto);
                if (deleted <= 0) {
                    throw new Exception("메뉴 권한 삭제에 실패했습니다.");
                }
            }

            // menuId가 DB에 없고고 realUse=1 → 추가
            if (!exist && "1".equals(menu.getRealUse())) {
                int inserted = menuAuthMapper.insertTbPermitDetail(menuAuthDto);
                if (inserted <= 0) {
                    throw new Exception("메뉴 권한 추가에 실패했습니다.");
                }
            }
        }
    }

}
