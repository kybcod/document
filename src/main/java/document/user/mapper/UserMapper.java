package document.user.mapper;

import document.user.dto.UserDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserMapper {
    List<UserDto> getUserList(UserDto userDto);
    List<UserDto> getMenuRoleList(UserDto userDto);
    UserDto getUserByUserId(String userId);
    int updateUserInfo(UserDto userDto);
    int insertUserInfo(UserDto userDto);
    int insertUserPkgInfo(UserDto userDto);
    void deleteUserInfo(UserDto userDto);
    void deleteUserPkgInfo(UserDto userDto);
    int updateUserPkgInfo(UserDto userDto);
    int updatePassword(String userId, String userPass);
    UserDto login(UserDto userDto);
}
