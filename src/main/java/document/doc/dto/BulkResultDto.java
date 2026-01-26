package document.doc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class BulkResultDto {
    private List<String> successIds;
    private List<BulkErrorDto> failList;
}