package document.user.service;

import document.exception.LoginException;
import document.user.dto.LoginStatus;
import document.user.dto.UserDto;
import document.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    /**
     * 사용자 리스트
     */
    public List<UserDto> getUserList(UserDto userDto) {
        return userMapper.getUserList(userDto);
    }

    /**
     * 권한 아이디 리스트"
     */
    public List<UserDto> getMenuRoleList(UserDto userDto) {
        return userMapper.getMenuRoleList(userDto);
    }

    /**
     * 사용자 정보 수정
     */
    public UserDto updateUserInfo(UserDto userDto) throws Exception {

        int updateUserInfo = userMapper.updateUserInfo(userDto);

        if (updateUserInfo > 0) {
            return userMapper.getUserByUserId(userDto.getUserId());
        }
        return null;
    }

    /**
     * 사용자 정보 추가
     */
    public UserDto insertUserInfo(UserDto userDto) throws Exception {

        UserDto existingUserId = userMapper.getUserByUserId(userDto.getUserId());

        if (existingUserId != null) {
            throw new Exception("이미 존재하는 사용자입니다.");
        }

        int insertUserInfo = userMapper.insertUserInfo(userDto);

        if (insertUserInfo > 0) {
            return userMapper.getUserByUserId(userDto.getUserId());
        }
        return null;
    }


    /**
     * 사용자 정보 삭제
     */
    public void deleteUserInfo(UserDto userDto) {
        userMapper.deleteUserInfo(userDto);
    }


    /**
     * 로그인
     */
    public UserDto login(UserDto userDto) throws Exception {

        // 1. 아이디 존재 여부 확인
        UserDto user = userMapper.getUserByUserId(userDto.getUserId());
        if (user == null) {
            throw new LoginException(LoginStatus.ID_NOT_FOUND);
        }


        // 2. 비밀번호 입력값 빈값인지 확인
        if (userDto.getUserPass() == null || userDto.getUserPass().isEmpty()) {
            throw new LoginException(LoginStatus.RESET_REQUIRED, user.getUserId());
        }

        // 3. 로그인 여부 확인
        String hashedPw = sha512(userDto.getUserPass());
        userDto = userDto.toBuilder().userPass(hashedPw).build();

        UserDto loginUser = userMapper.login(userDto);
        if (loginUser == null) {
            int failCnt = Integer.valueOf(user.getPwdFcnt()) + 1;
            userMapper.updatePwdFcnt(String.valueOf(failCnt), userDto.getUserId());
            throw new LoginException(LoginStatus.WRONG_PASSWORD);
        }

        userMapper.updatePwdFcnt("0", userDto.getUserId());

        // 4. 정상 로그인
        return loginUser;
    }



    /**
     * 비밀번호 변경
     */
    public UserDto changePassword(UserDto userDto) throws Exception {


        UserDto user = userMapper.getUserByUserId(userDto.getUserId());

        if (user == null) {
            throw new Exception("존재하지 않는 사용자입니다.");
        }

        String dbPhone = integerPhone(user.getUserTel()); // 010-1234-5678
        String inputPhone = integerPhone(userDto.getUserTel());

        if (!Objects.equals(dbPhone, inputPhone)) {
            throw new Exception("전화번호가 일치하지 않습니다.");
        }

        return updatePassword(userDto);
    }

    /**
     * 비밀번호 암호화 업데이트
     */
    private UserDto updatePassword(UserDto userDto) throws NoSuchAlgorithmException {
        String encodedPw = sha512(userDto.getUserPass());
        userMapper.updatePassword(userDto.getUserId(), encodedPw);
        return userDto;
    }


    /**
    * SHA-512 해시
    */
    private static String sha512(String password) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-512");
        md.update(password.getBytes());
        return String.format("%0128x", new BigInteger(1, md.digest()));
    }



    /**
     * 전화번호 숫자로만 비교
     */
    private String integerPhone(String phone) {
        log.info("phone {}", phone);
        return phone.replaceAll("[^0-9]", "");
    }
}
