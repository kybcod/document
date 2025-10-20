let grid = null;
let dataGrid = null;

$(document).ready(function (){
	dataGridSetting();
	dataGridSearch();
});

function dataGridSetting(){
	
	// dataGrid의 옵션을 세팅할 객체를 선언
	dataGrid = new dxdatagrid();
	
	// 데이터를 바인딩해줄 컬럼명과 화면에 표시될 이름을 순서대로 선언
	let columns = ['idx','NAME','CONTENTS','VAL_NUM','use_yn','create_date'];
	let captions = ['ID','이름','내용','값','삭제여부','작성일'];
	
	// 리스트로 만든 바인딩 정보를 dataGrid 객체에 삽입
	dataGrid.setColumns(columns);
	dataGrid.setCaptions(captions);
	
	// text-align를 설정
	// 설정해줄 컬럼이 여러개일경우 setCommonAlignment를 사용
	// 설정해줄 컬럼이 단일일경우 setAlignment 사용
	dataGrid.setAlignment('idx','right');
	dataGrid.setCommonAlignment(['NAME','use_yn','create_date'],'center');
	dataGrid.setCommonAlignment(['CONTENTS','VAL_NUM'],'left');
	
	// 세팅해놓은 옵션 객체를 넣어 element안에 뿌려줌
	// instance는 뿌려준 dataGrid를 이후에도 사용할수있게 객체화 시켜 선언시켜줌
	grid = $('#simpleDataGrid').dxDataGrid(dataGrid).dxDataGrid("instance");
}


function dataGridSearch(){
	$.ajax({
		url: "selectDataGrid",
		type: "get",
		success: function(result){
			// 이전에 선언해둔 dataGrid의 옵션에서 데이터를 보관하고있는 dataSource의 값을 새로 받은값으로 변경
			grid.option("dataSource",result);
		}, error: function(e){
			console.error(e);
		}
	})
}

function cellCustomizing(){
	
	dataGrid.setOnCellPrepared(function(e){
		// 헤더 풋터 제외
		if(e.rowType != 'data') return;
		if(e.column.dataField == "use_yn"){
			let val = e.value == "N" ? {color: "green", value: "사용가능"} : {color: "red", value: "잠김"};
			e.cellElement.css("color", val.color);
			e.cellElement.text(val.value);
		}
	})
	
	grid.option("onCellPrepared", dataGrid.onCellPrepared);
	
}

function dataFieldFormat(){
	
	// format을 이용하여 소수를 반올림처리할수 있다.
	let fixFormat = {
		type: "fixedPoint",
		precision: 2
	}
	
	dataGrid.setFormat(['VAL_NUM'], fixFormat);
	
	// 날짜의 컬럼은 아래와같이 dataType을 date 로 지정해주면 아래와같은 format을 삽입할 수 있다.
	// https://learn.microsoft.com/ko-kr/dotnet/standard/base-types/custom-date-and-time-format-strings
	// let dateFormat = "yyyy-MM-dd"
	let dateFormat = "yyyy-MM-dd HH:mm:ss"
	
	dataGrid.setDataType(['create_date'], "date");
	dataGrid.setFormat(['create_date'], dateFormat);
	
	grid.option("columns", dataGrid.columns);
}