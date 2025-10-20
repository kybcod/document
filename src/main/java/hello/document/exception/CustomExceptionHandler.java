package hello.document.exception;

import hello.document.exception.dto.ExceptionResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(Exception.class) // Exception 터지면 작동
    public ResponseEntity<?> apiException(Exception e) {
        e.printStackTrace();
        return new ResponseEntity<>(new ExceptionResponseDTO<>(-1,e.getMessage(),null), HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(LoginException.class)
    public ResponseEntity<?> handleLoginException(LoginException e) {
        e.printStackTrace(); // 로그 남기기

        ExceptionResponseDTO<String> response;
        switch (e.getStatus()) {
            case ID_NOT_FOUND:
                response = new ExceptionResponseDTO<>(401, "등록된 계정이 아닙니다. 관리자에게 문의하세요.", null);
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);

            case WRONG_PASSWORD:
                response = new ExceptionResponseDTO<>(401, "비밀번호가 틀렸습니다.", null);
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);

            case RESET_REQUIRED:
                response = new ExceptionResponseDTO<>(400, "비밀번호 초기화가 필요합니다.", e.getUserId());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            default:
                response = new ExceptionResponseDTO<>(500, "알 수 없는 오류", null);
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
