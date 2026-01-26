package document.doc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BulkErrorDto {
    private String docId;
    private String reason;
}

