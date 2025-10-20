/*******************************************************
저작권 : COPYRIGHTⓒ 2023 leenicoms.
작성일자: 2023.07.14
작성자: 홍성수
파일내용: devextreme list wrapper library
	   주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
	   주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
	   주3) event callback은 overloading하여 사용
변경이력:
	-. 2023.07.20 최초 작성
********************************************************/
// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxList/
function dxlist(){
	this.dataSource = [];
	
	this.selectionMode = "single";
	
	this.option = {};
	
	this.visible = true;
}

// 표시되는 글 field 지정
// 매개변수를 함수로 return값을 통해 조절 가능
/*
 * displayExpr: function(item) {
 *    // "item" can be null
 *    return item && 'ID: ' + item.id + ', Name: ' + item.name;
 *}
 */
dxlist.prototype.setField = function(field){
	this.displayExpr = field;
}

// 데이터소스 입력
dxlist.prototype.setDataSource = function(dataSource){
	this.dataSource = dataSource;
}

// checkbox Setting
// mode = single, multiple, none, all 각각 기본, checkBox제거, 전체선택추가
// text = 전체선택 text 지정
dxlist.prototype.setSelect = function(select, mode, text){
	// check box 유무
	this.showSelectionControls = select;
	
	this.selectionMode = mode; // 다중선택
	if(text){
		this.selectAllText = text;
	}
}

// 기본 키 세팅옵션
dxlist.prototype.setKey = function(keyId){
	// 키지정
	this.keyExpr = keyId;
}

// checkbox 선택시 이벤트
dxlist.prototype.setOnSelectionChanged = function(event){
	this.onSelectionChanged = event;
}
