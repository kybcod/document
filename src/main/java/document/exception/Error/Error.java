package document.exception.Error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.validation.FieldError;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class Error {

    @Getter
    @AllArgsConstructor
    public enum ErrorEnum {
        NOT_NULL("Null 값을 허용하지 않습니다."),
        NOT_EMPTY("를(을) 입력해주세요."),
        NOT_BLANK("공백과 빈 값은 넣을 수 없습니다."),
        EMAIL("Email 형식에 맞지 않습니다.");

        private final String value;
    }

    public static class ErrorMessage {
        public static String getDefaultErrorMessage(FieldError fieldError) {
            return fieldError.getDefaultMessage();
        }

        public static String getErrorMessage(FieldError fieldError) {

            String message = "";
            switch (Objects.requireNonNull(fieldError.getCode())) {
                case "NotNull" -> message =  fieldError.getDefaultMessage() + "은(는) " + ErrorEnum.NOT_NULL.getValue();
                case "NotEmpty" -> message = fieldError.getDefaultMessage() + "은(는) " + ErrorEnum.NOT_EMPTY.getValue();
                case "NotBlank" -> message = fieldError.getDefaultMessage() + "은(는) " + ErrorEnum.NOT_BLANK.getValue();
                case "Email" -> message = fieldError.getDefaultMessage() + "은(는) " + ErrorEnum.EMAIL.getValue();
                case "Pattern" -> message = fieldError.getDefaultMessage();
            }
            return message;
        }

        // 여러 필드를 하나로 묶어 메시지 반환
        public static String getGroupedErrorMessage(List<FieldError> fieldErrors) {
            // 오류 코드 그룹핑: 동일한 오류 코드에 대한 필드들 그룹화
            Map<String, List<FieldError>> groupedErrors = fieldErrors.stream()
                    .collect(Collectors.groupingBy(FieldError::getCode));

            // 최종 메시지 리스트
            List<String> errorMessages = new ArrayList<>();

            // 그룹핑된 오류 코드 별로 메시지 생성
            for (Map.Entry<String, List<FieldError>> entry : groupedErrors.entrySet()) {
                String errorCode = entry.getKey();
                List<FieldError> errorsForCode = entry.getValue();

                // 필드명들을 모아서 하나로 묶기 (예: "메뉴 ID, 메뉴 그룹, 메뉴 사용 유무")
                List<String> fieldNames = errorsForCode.stream()
                        .map(FieldError::getDefaultMessage)
                        .collect(Collectors.toList());
                String fieldsString = String.join(", ", fieldNames);

                // 오류 코드에 맞는 공통 메시지
                String commonMessage = switch (errorCode) {
                    case "NotNull" -> ErrorEnum.NOT_NULL.getValue();
                    case "NotEmpty" -> ErrorEnum.NOT_EMPTY.getValue();
                    case "NotBlank" -> ErrorEnum.NOT_BLANK.getValue();
                    case "Email" -> ErrorEnum.EMAIL.getValue();
                    default -> "";
                };

                // 최종 메시지 추가
                errorMessages.add(fieldsString + "은(는) " + commonMessage);
            }

            // 여러 오류 메시지들을 "\n"으로 구분해서 반환
            return String.join("\n", errorMessages);
        }

    }

}
