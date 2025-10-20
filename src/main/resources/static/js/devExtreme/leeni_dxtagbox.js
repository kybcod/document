/**************************************************************************************************************
저작권 : COPYRIGHTⓒ 2023 leenicoms.
작성일자: 2023.09.15
작성자: 홍성수
파일내용: devextreme treeview wrapper library
	   주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
	   주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
	   주3) event callback은 overloading하여 사용
변경이력:
	-. 2023.09.15 최초 작성
***************************************************************************************************************/


/**************************************************************************************************************
	TagBox
	※다중 셀렉트
 
	https://js.devexpress.com/Demos/WidgetsGallery/Demo/TagBox/Overview/jQuery/Light/
 
 $('#productsCustom').dxTagBox({
	// 기본세팅
	dataSource: 데이터소스(늘 넣던데로),
	value: List(현제 선택되어있는 value값),
	displayExpr: 이름(화면에 표시할 컬럼명),
	valueExpr: valueName(value를 뽑아올 컬럼명),
	
	// 기본옵션
	placeholder: String (아무것도 선택되지않았을때 표시될 메세지),
	noDataText: String (데이터없을시 표시될 메세지),
	showDropDownButton: true/false(기본값) (드롭다운 버튼 표시여부),
	showClearButton: true/false(기본값) (clear버튼을 표시할지),
	readOnly: true/false(기본값) (readOnly 적용),
	multiline: true(기본값)/false (검색박스가 여러줄이 될수있는지 여부),
	label: String (TagBox 라벨지정),
	labelMode: static(기본값)/floating/hidden (label 활성화시),
	(static: TagBox 윗줄에 걸쳐서 표시/floating: Box안에 표시/hidden: 표시안함)
	hoverStateEnabled: true(기본값)/false (마우스 hover상태 표시 여부),
	
	// 추가옵션
	hideSelectedItems: true/false(기본값) (선택시 목록에서 제거할지 여부),
	showSelectionControls: true/false(기본값) (selectBox안 checkBox로 컨트롤),
	selectAllText: String (showSelectionControls활성화 시) (전체선택의 텍스트 조절),
	applyValueMode: instantly(기본값)/useButtons (버튼을 통해서 최종선택 여부 판단할지),
	maxDisplayedTags: int (최대로 보여줄 태그 수 ※관리하기 힘들수있으니 hideSelectedItems와 같이쓰지 않도록하자),
	showMultiTagOnly: true(기본값)/false (최대 갯수가 넘어간 태그 표시시 일반태그 없이 멀티태그로 보여줄지 false면 마지막 태그만 멀티태그로 보임),
	
	//검색
	searchEnabled: true/false(기본값) (검색기능활성화),
	searchExpr: List (검색 컬럼 지정),
	searchMode: contains(기본값)/startswith (검색모드 1: 글자가 포함된 검색 2: 글자로 시작하는 검색),
	searchTimeout: int (최대검색시간 적용),
	
 });
***************************************************************************************************************/

function dxtagbox(){
	// 기본 UI의 z-index 지정
	DevExpress.ui.dxOverlay.baseZIndex(9999999999999);
	
	
	this.dataSource = [];
	
	this.placeholder = "";
	this.noDataText = "데이터 없음";
	this.showClearButton = true;
	this.showDropDownButton = false;
	this.hoverStateEnabled = true;
	
	this.multiline = false;
	this.searchEnabled = true;
	this.searchMode = "contains";
}

/* 기본 field 지정
	val = value값이 있는 컬럼명을, name은 화면에 표시될 내용이 있는 컬럼명을 넣는다.
*/
dxtagbox.prototype.setField = function(val,name){
	this.valueExpr = val;
	this.displayExpr = name;
}

/* 선택할 value값 입력
	val = List타입이다.
	※ 처음 그려줄때를 제외한다면 매번 다시그려줘야하니 tagBox를 그려준 후에는 데이터를 넣어줄때
	tagBox =  $().dxTagBox("instance")로 객체를 빼내어서 tagBox.option("value",[]) 으로 넣어주도록하자 사용하도록하자
*/
dxtagbox.prototype.setValue = function(val){
	this.value = val
}

// placeholder 지정
dxtagbox.prototype.setPlaceholder = function(holder){
	this.placeholder = holder;
}

/* 
	search 사용여부 지정
	함수 선언시 true를 기본으로 세팅했으니 검색기능을 사용하지 않고싶을때만 false로 넣어주도록하자
*/
dxtagbox.prototype.setSearch = function(search){
	this.searchEnabled = search;
}

/*
	selectBox안 checkBox로 컨트롤
	selectAll 매개변수는 전체선택 메세지 지정
*/
dxtagbox.prototype.setCheckBox = function(selectAll){
	this.showSelectionControls = true;
	this.selectAllText = selectAll;
}

/*
	확인 / 취소 버튼으로 컨트롤할지의 유무
	기본값은 false이므로 사용할때만 true로 넘겨주면서 선언하자
*/
dxtagbox.prototype.setApplyValueMode = function(bln){
	this.applyValueMode = bln;
}

/*
	선택 태그 관련 함수
	maxTag는 최대로 표시할 태그수를 입력,
	multiOnly는 지정한 최대갯수가 넘어갈때 무조건 multiTag로만 표시할지의 유무를 true false 로 입력
	true면 multiTag만 나오고 false면 마지막 태그만 변한다
	multiOnly는 true가 기본값이므로 true로 넣고자한다면 매개변수를 안넣어도 된다.
*/
dxtagbox.prototype.setDisplayedTag = function(maxTag, multiOnly){
	this.maxDisplayedTags = maxTag;
	if(multiOnly != undefined || multiOnly != null){
		this.showMultiTagOnly = multiOnly;
	}
}

/*
	드롭박스를 표시할지의 여부
	매개변수는 true/false 기본값이 false이므로 추가할때만 true로 넣자
*/
dxtagbox.prototype.setShowDropDownButton = function(bln){
	this.showDropDownButton = bln
}