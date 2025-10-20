/*******************************************************
저작권 : COPYRIGHTⓒ 2023 leenicoms.
작성일자: 2023.07.14
작성자: 홍성수
파일내용: devextreme treeview wrapper library
	   주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
	   주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
	   주3) event callback은 overloading하여 사용
변경이력:
	-. 2023.07.14 최초 작성
********************************************************/
function dxtreeview(){
	this.dataSource = [];
	
	this.noDataText = "";
	
	this.showCheckBoxesMode = "nomal";
	this.expandEvent = "dblclick"; // 확장조건 dblclick, click
	this.selectionMode = "multiple"; // 다중선택
	this.selectNodesRecursive = true; // 하위 모든 checkBox 선택
	this.focusStateEnabled = false;
	// 데이터 적용 형태 지정
	// tree: item 형태로 적용 (Object안에 item키 안에 object)
	// plain: parent 형태 적용 ({id:1, parent:0, text: "aa"},{id:1, parnet:1, text: "aa하위"}) rootValue지정 안되있으면 최상위 parent = 0 or undefiend
	// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxTreeView/Configuration/#dataStructure
	this.dataStructure = "plain";
	
	this.option = {};
	
	this.visible = true;
}

// 표시되는 글 field 지정
// 매개변수를 함수로 return값을 통해 조절 가능
// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxTreeView/Configuration/#disabledExpr
/*
 * displayExpr: function(item) {
 *    // "item" can be null
 *    return item && 'ID: ' + item.id + ', Name: ' + item.name;
 *}
 */
dxtreeview.prototype.setField = function(field){
	this.displayExpr = field;
}

// 데이터소스 입력
dxtreeview.prototype.setDataSource = function(dataSource){
	this.dataSource = dataSource;
}

// check박스 기능의 옵션적용
// mode = nomal, none, selectAll 각각 기본, checkBox제거, 전체선택추가
// text = 전체선택 text 지정
dxtreeview.prototype.setSelectAll = function(mode, text){
	this.showCheckBoxesMode = mode;
	this.selectAllText = text;
/*	if (mode === "selectAll") {
		this.onContentReady = function(e) {
			if (this._dataSource._items.length > 0) {
			}
		}
	}*/
}

// 선택 옵션 변경 ※ showCheckBoxesMode가 nomal일때만 적용
// multiple = 다중, single = 단일
dxtreeview.prototype.setSelectionMode = function(mode){
	this.selectionMode = mode;
}

// 기본 키 세팅옵션
dxtreeview.prototype.setId = function(keyId, parentId, rootValue){
	// 키지정
	this.keyExpr = keyId;
	// 상위계체 키 바인딩
	this.parentIdExpr = parentId;
	// 최상위 parent 값 지정 ※기본: 0 or undefiend
	this.rootValue = rootValue;
}

// checkbox 선택시 이벤트
dxtreeview.prototype.setOnSelectionChanged = function(event){
	this.onSelectionChanged = event;
}

// 컨탠츠 준비완료시 이벤트
dxtreeview.prototype.setOnContentReady = function(event){
	this.onContentReady = event;
}

// 컨탠츠 클릭시 이벤트
dxtreeview.prototype.setOnItemClick = function(event){
	this.onItemClick = event;
}

// 로드시 이벤트
dxtreeview.prototype.setOnItemRendered = function(event){
	this.onItemRendered = event;
}

// 탭 축소시 이벤트
dxtreeview.prototype.setOnItemCollapsed = function(event){
	this.onItemCollapsed = event;
}

dxtreeview.prototype.setExpandedExpr = function(expr){
	this.expandedExpr = expr;
}

/**
 * treeView 검색기능 추가
 * type
 * contains: 해당 단어 포함
 * startswith: 해당 단어로 시작
 * equals: 해당 단어 일치
 */
dxtreeview.prototype.setSearch = function(searchType,enabled){
	this.searchMode = searchType
	this.searchEnabled = enabled;
}

dxtreeview.prototype.setItemRendered = function(event){
	this.itemRendered = event;
}

/**
 * 확장 축소 아이콘 변경
 * collapseIcon 은 축소됬을때 아이콘
 * expandIcon 은 확장 시 아이콘
 * https://js.devexpress.com/jQuery/Documentation/ApiReference/UI_Components/dxTreeView/Configuration/#expandIcon
 */
dxtreeview.prototype.setIcon = function(colIcon, expIcon){
	this.collapseIcon = colIcon;
	this.expandIcon = expIcon;
}