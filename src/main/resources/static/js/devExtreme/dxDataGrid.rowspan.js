//참고 row merge : https://supportcenter.devexpress.com/ticket/details/t337848/dxdatagrid-is-it-possible-to-merge-cells
//참고 dxGrid configuration : https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/
/*
.dx-datagrid-rowsview {  
  border: 1px solid red; ; !important
}  
*/
/////////////////////////////////////////////////////////////////////////////////////////
// row span(row span) callback
var rowSpanElement = {}; 

function dxDataGridRowSpan(e) {
	
	if (e.rowType != "data") return;
	if (e.column.allowMerge == undefined) return;
	if (e.column.allowMerge == false) return;
	
	e.cellElement.css("vertical-align", "middle");  

	let isRowSpan = false;
	
	if (e.rowIndex > 0 && e.column.command != "edit") {  
		//e.component.cellValue(e.rowIndex - 1, e.column.dataField) == e.value : 이전 dataField의 값이 현재 e.value와 같은지를 검사
		if (e.component.cellValue(e.rowIndex - 1, e.column.dataField) == e.value) {  
			//이전 dataField의 값이 존재하는 지를 검사
			if (e.component.cellValue(e.rowIndex - 1, e.column.dataField)) {
				//최초 row span이 필요한 cellElement get
				var prev = rowSpanElement[e.rowIndex - 1][e.column.dataField];

				if (!rowSpanElement[e.rowIndex]) rowSpanElement[e.rowIndex] = {};  

				//현재 cell에 최초 cellElement를 복사하여 동일하게 만듬
				rowSpanElement[e.rowIndex][e.column.dataField] = prev;  
				if (prev) {  
					//현재 cellElement를 보이지 않게함
					e.cellElement.css("display", "none");  

					//최초 cellElement에 rowspan attribute를 가져옴
					var span = prev.attr('rowspan');  
					if (span) prev.attr('rowspan', Number(span) + 1);  	//최초 cellElement에 span이 정보가 있으면 rowspan++
					else prev.attr('rowspan', 2);  						//최초 cellElement에 span이 정보가 있으면 2
				}
				
				isRowSpan = true;
			}
		}
	}  
	if (isRowSpan) return;

	//rowSpanElement[e.rowIndex]가 undefined이면 rowSpanElement[e.rowIndex]에 {} 객체 생성
	if (!rowSpanElement[e.rowIndex]) rowSpanElement[e.rowIndex] = {};  
	
	//현재 cellElement를 set
	rowSpanElement[e.rowIndex][e.column.dataField] = e.cellElement;  		
}  //end of rowSpan
/////////////////////////////////////////////////////////////////////////////////////////
