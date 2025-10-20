/*******************************************************
저작권 : COPYRIGHTⓒ 2023 leenicoms.
작성일자: 2023.03.16
작성자: 
파일내용: devextreme treelist wrapper library
	   주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
	   주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
	   주3) event callback은 overloading하여 사용
변경이력:
	-. 2023.03.16 최초 작성
********************************************************/
function dxtreelist() {
	this.dataSource = [];
	this.columns = [];
	this.showBorders = true;
	this.allowColumnResizing = true;
	this.columnAutoWidth = true;
	this.columnResizingMode = 'widget';
	this.showColumnLines = true;
	this.showRowLines = true;
	this.hoverStateEnabled = true;
	this.scrolling = {
		showScrollbar: "always",
	}
	this.paging = {
		enabled: false,
	};
	this.noDataText = "조회된 데이터가 없습니다."
	this.toolbar = {};
	this.option = {};
	this.editing = {};
	this.onRowClick = {};
	this.selection = {};
	this.cellVerticalAlign = "top";

	this.onCellPrepared = (e) => {
		e.cellElement.css({
			"vertical-align": `${this.cellVerticalAlign}`,
			"font-size": "16px",
			"min-height": "28px",
		});
	};

	this.onRowPrepared = (e) => {
		if (e.rowType == 'data' && e.data.menuGroup == '0000') {
			e.rowElement.css({
				"background-color" : "#f7f7f7",
				"font-weight": "bold"
			});
		}
	};
}

/**
 * keyType 넣어질 데이터의 key가될 ID 컬럼 이름(ID) 
 * parentId 참조한 ID이름
 * 테이블 2개의 내용을 합쳐서가져올 경우 서로의 ID명은 같고 참조된 테이블의 다른 한쪽의 ID명을 다르게 해야함 
 * root는 parentId의 최소값을 정함 부모객체에 parentId값이 없을 경우 false로 넣어주면 됨
 */
dxtreelist.prototype.setId = function(keyId,parentId,root){
	this.keyExpr = keyId;
  this.parentIdExpr = parentId;
	this.rootValue = root??'0';
}




/**
 * datagrid의 모드 설정
 * grid의 mode를 설정하고 추가, 수정, 삭제 기능 사용여부를 결정한다.
 * data type은 String, boolean, boolean, boolean이다. ex) mode = 'popup'; allowAdding = true; allowUpdating = true; allowDeleting = true;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/
 */
dxtreelist.prototype.setEditing = function (mode, allowAdding, allowUpdating, allowDeleting) {
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/#mode
	//Accepted Values: 'batch' | 'cell' | 'row' | 'form' | 'popup'
	this.editing.mode = mode;
	this.editing.texts = {};
	this.editing.popup = {};
	this.editing.loadPanel = {};
	this.editing.form = {};
	this.editing.allowAdding = allowAdding;
	this.editing.allowUpdating = allowUpdating;
	this.editing.allowDeleting = true;
	this.editing.loadPanel.enabled = true;
	this.editing.useIcons = true;
};

/**
 * 추가,수정,삭제 관련 UI 요소에 대한 텍스트를 지정하는 속성을 포함한다.
 * data type은 String, String이다. ex) deleteTitle = '게시글'; deleteMsg = '삭제하시겠습니까?';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/texts/
 */
dxtreelist.prototype.setEditingTexts = function (deleteTitle, deleteMsg) {
	this.editing.texts.addRow = '추가';
	this.editing.texts.editRow = '수정';
	this.editing.texts.deleteRow = '삭제';
	this.editing.texts.saveRowChanges = 'Save';
	this.editing.texts.cancelRowChanges = 'Cancel';
	this.editing.texts.confirmDeleteTitle = deleteTitle;
	this.editing.texts.confirmDeleteMessage = deleteMsg;
};

/**
 * 추가,수정,삭제 관련 UI 요소에 대한 텍스트를 지정하는 속성을 포함한다.
 * data type은 String, int, int이다. ex) title = '게시글'; width = 700; height = 525;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/#popup
 */
dxtreelist.prototype.setEditingPopup = function (title, width, height) {
	this.editing.popup.showTitle = true;
	this.editing.popup.title = title;
	this.editing.popup.width = width;
	this.editing.popup.height = height;
};


/**
 * popup창 UI 요소에 대한 설정 속성이다.
 * data type은 array, int, int, String이다.
 * ex) dataField = ['WRITER', 'SUBJECT', 'WRITE_DATE', ['CONTENT',150]]; colCount = 1; colSpan = 2; caption = '게시글'
 * textArea를 사용하려면 배열로 넘겨주면 된다. 높이를 지정할 수 있다.
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/#form
 */
dxtreelist.prototype.setEditingForm = function (dataField, colCount, colSpan, caption, requiredFields = [] ) {
	this.editing.form.items = [];
	let items = {};
	items.itemType = 'group';
	items.colCount = colCount;
	items.colSpan = colSpan;
	items.title = {};
	items.items = [];

	for (let i = 0; i < dataField.length; i++) {
		let editor = {};
		if (typeof dataField[i] === 'object') {
			editor.dataField = dataField[i][0];
			editor.editorType = 'dxTextArea';
			editor.colSpan = colSpan;
			editor.editorOptions = { height: dataField[i][1] };
		} else {
			editor.dataField = dataField[i];

			if (editor.dataField === 'menuGroup') {
				editor.colSpan = colCount; // 한 줄 전체
				editor.editorOptions = {
					onContentReady: function(e) {
						if ($(e.element).next(".menuGroupGuide").length === 0) {
							$("<div>")
								.addClass("menuGroupGuide")
								.text("상위 메뉴는 0000, 하위 메뉴는 상위 메뉴의 메뉴ID에 따라 설정해주시면 됩니다.")
								.css({ color: "#555",  marginTop: "5px",  marginBottom: "7px" })
								.insertAfter(e.element);
						}
					}
				};
			}else if (editor.dataField === 'menuDesc') {
				editor.colSpan = colCount; // 한 줄 전체
				editor.editorType = 'dxTextArea';
			} else {
				editor.colSpan = 1; // 나머지 필드는 1칸씩
			}


		}

		// 필수 입력 필드 지정
		if (requiredFields.includes(editor.dataField)) {
			editor.validationRules = [{ type: 'required', message: editor.dataField + '는 필수 입력입니다.' }];
		}


		items.items.push(editor);
	}

	this.editing.form.items.push(items);
};

/**
 * columns의 속성인 validationRules의 속성
 * 빈값 체크, 컬럼의 필수항목입력으로 지정하여 검증하는 함수
 * data type은 String, String, String, String또는int 이다. ex) dataField = 'ID',type = 'required', message = '아이디를 입력해주세요.', param = 10
 * param은 추가 속성으로 max,pattern 등의 값을 넣어준다.
 * Type: Array<RequiredRule | NumericRule | RangeRule | StringLengthRule | CustomRule | CompareRule | PatternRule | EmailRule | AsyncRule>
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#validationRules
 */
dxtreelist.prototype.setValidationRules = function (dataField, type, message, param) {
	for (let i = 0; i < this.columns.length; i++) {

		if (this.columns[i].dataField != dataField) continue;

		let array = [];
		let validation = {};
		if (this.columns[i].validationRules != null) {
			for (let j = 0; j < this.columns[i].validationRules.length; j++) {
				validation = {};
				validation.type = this.columns[i].validationRules[j].type;
				validation.message = this.columns[i].validationRules[j].message;
				validation.max = this.columns[i].validationRules[j].max;
				validation.pattern = this.columns[i].validationRules[j].pattern;
				array.push(validation);
			}
		}

		validation = {};
		switch (type) {
			case 'required':
				break;
			case 'stringLength':
				validation.max = param;
				break;
			case 'pattern':
				validation.pattern = param;
				break;
		}

		validation.type = type;
		validation.message = message;
		array.push(validation);
		this.columns[i].validationRules = array;
	}
};

dxtreelist.prototype.setOnToolbarPreparing = function(onEvt) {
	this.onToolbarPreparing = onEvt;
};

/**
 * datagrid의 update 기능이다.
 * data type은 object이다. ex) onEvt = updateBoard;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onRowUpdating
 */
dxtreelist.prototype.setOnRowUpdating = function (onEvt) {

	this.onRowUpdating = function (e) {
		const deferred = $.Deferred();
		const promptPromise = DevExpress.ui.dialog.confirm("수정하시겠습니까?");
		promptPromise.done((dialogResult) => {
			if (dialogResult) {
				for (let i in e.newData) {
					e.oldData[i] = e.newData[i];
				}

				onEvt(e.oldData, deferred);
			} else {
				deferred.resolve(true);
			}
		});
		e.cancel = deferred.promise();
	}

};

/**
 * datagrid의 insert 기능이다.
 * data type은 object이다. ex) onEvt = insertBoard;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onRowInserting
 */
dxtreelist.prototype.setOnRowInserting = function (onEvt) {

	this.onRowInserting = function (e) {
		const deferred = $.Deferred();
		const promptPromise = DevExpress.ui.dialog.confirm("등록하시겠습니까?");
		promptPromise.done((dialogResult) => {
			if (dialogResult) {
				onEvt(e.data, deferred);
			} else {
				deferred.resolve(true);
			}
		});
		e.cancel = deferred.promise();
	}
};

/**
 * datagrid의 delete 기능이다.
 * data type은 object이다. ex) onEvt = deleteBoard;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onRowRemoving
 */
dxtreelist.prototype.setOnRowRemoving = function (onEvt) {
	this.onRowRemoving = function (e) {
		onEvt(e.data);
	}
};


/**
 * 특정 필드 활성화/비활성화 전역 메서드
 * data type은 string 이다. ex) column = 'name';
 */
dxtreelist.prototype.setColumnReadOnly = function(column) {
	this.onEditorPreparing = function(e) {
		if (e.parentType === "dataRow" && e.dataField === column) {
			e.editorOptions.readOnly = !e.row.isNewRow;
		}
	};
};
/**
 * 신규 행일 때 특정 필드 초기화
 * data type은 string 이다. ex) column = 'menuGroup';
 */
dxtreelist.prototype.clearFieldOnNewRow = function(column) {
	this.onEditorPreparing = (e) => {
		if (e.parentType === "dataRow" && e.dataField === column && e.row.isNewRow) {
			// 신규 행일 경우 초기값 강제로 빈값으로 세팅
			e.editorOptions.value = "";
		}
	};
};



dxtreelist.prototype.setRootValue = function(root){
	this.rootValue = root;
}

 // sorting은 열기준 정렬을 허용하는지의 여부 boolaen속성
dxtreelist.prototype.setSorting = function(sorting){
	this.sorting = sorting;
}

/**
 * treelist의 data source를 지정 = server에서 받아온 data를 넣어준다.
 */
dxtreelist.prototype.setDataSource = function(dataSource) {
	this.dataSource = dataSource;
};

/**
 * paging처리 pagesize datatype은 int 로 페이지 내에 표시할 게시글 갯수를 적는다
 */
dxtreelist.prototype.setPaging = function(pageSize){
	this.paging = {};
	this.paging.enabled = true;
	this.paging.pageSize = pageSize;
	this.scrolling = {};
	this.pager = {
		visible: 'true',
		showNavigationButtons: true
	};
}

/**
 * treelist의 컬럼을 지정
 * server에서 받아온 데이터 컬럼명을 넣어주면 자동으로 값이 바인딩되서 list가 그려진다.
 * data type은 배열 ex) columns = ['Prefix','FirstName','LastName','Position','StateID','BirthDate']
 */
dxtreelist.prototype.setColumns = function(columns) {
	columns.forEach(function(column) {
		let colConfig = { dataField: column, alignment: "center" };

		if (column === "crtDt") {
			colConfig.customizeText = function(cellInfo) {
				const dateStr = cellInfo.value;
				if (typeof dateStr === "string" && dateStr.includes(" ")) {
					return dateStr.split(" ")[0];
				}
				return dateStr;
			};
		}

		if (column === "menuUse") {
			colConfig.editCellTemplate = function(cellElement, cellInfo) {
				$('<div />').dxRadioGroup({
					dataSource: [
						{ text: 'Y', value: '1' },
						{ text: 'N', value: '0' }
					],
					valueExpr: "value",
					displayExpr: "text",
					value: cellInfo.value,
					layout: 'horizontal',
					onValueChanged: function(e) {
						cellInfo.setValue(e.value);
					}
				}).appendTo(cellElement);
			};
			colConfig.cellTemplate = function(container, options) {
				const value = options.value === '1' ? 'Y' : 'N';
				$('<span>')
					.text(value)
					.appendTo(container);
			};
		}
		this.columns.push(colConfig);
	}, this);
};

/**
 * 로드시 자동으로 모든 행을 열어둘 것인지 datatype은 boolean
 */
dxtreelist.prototype.setAutoExpandAll = function(autoExpand){
	this.autoExpandAll = autoExpand;
}

// 	열의 밑줄표시 여부 boolaen타입
dxtreelist.prototype.setShowRowLines = function(rowLines){
	this.showRowLines = rowLines;
}


/**
 * columns의 속성
 * 테이블 필드명 지정, caption을 지정하지않으면 server에서 받아온 컬럼으로 필드명이 표시된다.
 * data type은 배열 ex) captions = ['Title','','','','',''] 빈값은 dataField로 표시된다.
 */
dxtreelist.prototype.setCaptions = function(captions) {
	for (let i = 0; i < this.columns.length; i++) {
		if (!captions[i]) continue;
		
		this.columns[i].caption = captions[i];
	}
};


/**
 * treelist의 width 설정
 * grid의 width를 설정한다.
 * data type은 String, int이다. ex) dataField = 'ID', width = 130;
 */
dxtreelist.prototype.setWidth = function(dataField, width) {
	for (let i = 0; i < this.columns.length; i++) {
		if (this.columns[i].dataField != dataField) continue;
		
		this.columns[i].width = width;
	}
};

/**
 * treelist 하위 데이터 유무 확인
 */
dxtreelist.prototype.setHasItemsExpr = function(expr) {
	this.hasItemsExpr = expr;
}

/**
 * treelist의 행 선택 모드
 * data type은 String이다. ex) mode = 'multiple';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxtreelist/Configuration/selection/#mode
 * Accepted Values: 'single' | 'multiple' | 'none'
 */
dxtreelist.prototype.setSelection = function(mode) {
	this.selection = {};
	this.selection.mode = mode;
};


// type = true false
// 마우스를 올렸을 때 색변경
dxtreelist.prototype.setHoverStateEnabled = function(type){
	this.hoverStateEnabled = type;
}

// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxTreeList/Configuration/#onCellPrepared
// 각 셀의 정보를 수정가능
dxtreelist.prototype.setOnCellPrepared = function(onEvt) {
	this.onCellPrepared = onEvt;
};


dxtreelist.prototype.setFocusedCellChanging = function(onEvt) {
	this.onFocusedCellChanging = onEvt;
};


dxtreelist.prototype.setFocusedCellChanged = function(onEvt) {
	this.onFocusedCellChanged = onEvt;
};


dxtreelist.prototype.setKeyDown = function(onEvt) {
	this.onKeyDown = onEvt;
};


/**
 * treelist의 행 클릭 이벤트 처리
 * data type은 object이다. ex) onEvt = onRowClick;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxtreelist/Configuration/#onRowClick
 */
dxtreelist.prototype.setOnRowClick = function(onEvt) {
	this.onRowClick = onEvt;
};

dxtreelist.prototype.setOnRowDblClick = function(onEvt) {
	this.onRowDblClick = onEvt;
};

dxtreelist.prototype.setOnCellClick = function(onEvt) {
	this.onCellClick = onEvt;
};


dxtreelist.prototype.setOnCellDblClick = function(onEvt) {
	this.onCellDblClick = onEvt;
};

/**
 * datagrid의 toolbar 생성
 * data type은 int, 2차배열, object이다.
 * ex) num = 3, btn = [['엑셀다운로드', false, false, true, 'edit', onChoiceUpdate],['삭제', false, true, true, 'trash', onChoiceDelete]]; callback = callBackToolbarOnclick;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/toolbar/
 */
dxtreelist.prototype.setToolbar = function(num , btn , callback) {
	this.toolbar.items = [];

	for (let i = 0; i < num; i++) {
		items = {};
		items.options = {};
		items.showText = 'always';
		items.options.text = btn[i][0];
		items.location = 'after';
		items.widget = 'dxButton';

		items.options.elementAttr = {
			id: "btnText" + i,
		};

		if (btn[i][1]) {
			items.name = 'addRowButton';
		} else {
			//if (onEvt[i] != '') {
			items.name = btn[i][0];
			items.options.onClick = callback;
			//}
		}

		if (btn[i][3]) {
			items.options.icon = btn[i][4];
		}
		this.toolbar.items.push(items);
	}
};

dxtreelist.prototype.onClickToolbar = function(dxGrid, onEvt) {
	onEvt(dxGrid);
}

dxtreelist.prototype.setAlignment = function(dataField, alignment) {
	for (let i = 0; i < this.columns.length; i++) {
		if (this.columns[i].dataField != dataField) continue;

		this.columns[i].alignment = alignment;
	}
};

//각 행별 음영처리
//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#rowAlternationEnabled
dxtreelist.prototype.setRowAlternationEnabled = function(bl){
	this.rowAlternationEnabled = bl;
}

/**
 * dxtreelist alignment 설정
 * grid의 alignment를 설정한다.
 * data type은 String, String이다. ex) dataField = ['ID','PWD'], width = 'center';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxtreelist/Configuration/columns/#alignment
 * Accepted Values: undefined | 'center' | 'left' | 'right'
 */
dxtreelist.prototype.setCommonAlignment = function(dataField, alignment) {
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].alignment = alignment;
		}
	}
}

dxtreelist.prototype.setShowColumnHeader = function(showHeader){
	this.showColumnHeaders = showHeader;
}

dxtreelist.prototype.setShowBorders = function(border){
	this.showBorders = border;
}

// mode = virtual or standard
dxtreelist.prototype.setScrolling = function(setMode){
	this.scrolling = {
			mode: setMode
		}
}

dxtreelist.prototype.setOnRowPrepared = function(onEvt){
	this.onRowPrepared = onEvt;
}

// 컬럼의 검색가능여부를 지정
dxtreelist.prototype.setAllowSearch = function(dataField,boolean){
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].allowSearch = boolean;
		}
	}
}

dxtreelist.prototype.setSearchText = function(text){
	this.searchPanel = {
		text: text,
		highlightSearchText: false
	}
}

dxtreelist.prototype.setSortingNone = function(){
	this.sorting={
		mode: 'none'
	};
}

// 그리드가 그려질 때 펼쳐져있는 행의 Key 지정
dxtreelist.prototype.setExpandedRowKeys = function(list){
	this.expandedRowKeys = list;
}

// 최소 width를 지정
// dataField는 배열
dxtreelist.prototype.setMinWidth = function(dataField, minWidth) {
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].minWidth = minWidth;
		}
	}
};

// 모든 컬럼의 최소 width값을 지정
// widthList는 배열로
dxtreelist.prototype.setMinWidthList = function (widthList) {
	for (let i = 0; i < this.columns.length; i++) {
		this.columns[i].minWidth = widthList[i];
	}
};

/**
 * datagrid의 data key 값을 지정, key값으로 CRUD기능 처리한다.
 */
dxtreelist.prototype.setKeyExpr = function (keyExpr) {
	this.keyExpr = keyExpr;
	// customDataSource 를 위한 키처리
	if (this.dataSource && this.dataSource.load) this.dataSource._key = keyExpr;
};

/**
 *  화면 크기에 따른 AutoPaging을 설정해준다.
 */
dxtreelist.prototype.setAutoPaging = function (gridId) {
	this.scrolling = {
		mode: 'standard'
	}
	//this.scrolling.rowRenderingMode = 'virtual';
	this.onContentReady = function (e) {

		let grid = $(gridId).dxTreeList("instance");
		if (grid) {
			grid.pageSize(grid.pageSize()); // 기존 세팅 유지 (예: 5)
		}

		if (e.component.getDataSource() && e.component.getDataSource()._items.length > 0 && e.element.is(":visible")) {
			e.component.option("onContentReady", null);
		}
	}
	$(gridId).addClass("set-auto-paging");
}



/**
 * 서버단 페이징 리프레시
 *
 * 매개변수 obj 는 필요한 속성들을 객체화 시킨것이다.
 * obj의 param은 서버로 보내줄 object형식의 데이터이다.
 * obj의 url은 서버 통신에 필요한 url 주소며 변경시에만 넣어주면 된다.
 * obj의 callBack은 서버에서 데이터를 받아온 후에 실행되는 callBack함수로 변경시에만 넣어주면 된다.
 * obj의 key는 데이터그리드 세팅시 사용될 key값이며 변경시에만 넣어주면 된다.
 * obj의 keepPage은 리프레시 시 현제 페이지를 유지할지의 유무이다. 페이지를 유지하고싶으면 true를 넣어주면 된다.
 */
dxtreelist.prototype.setRemotePaging = function (obj) {
	this.remoteOperations = true;
	this.url = obj ? obj.url : null;
	let setKey = (obj && obj.key) ? obj.key : this.keyExpr;
	this.callBack = obj ? obj.callBack : null;

	this.dataSource = devCustomDataSource({ url: this.url, param: obj ? obj.param : null, callBack: this.callBack, key: setKey });

}

function dxTreeListHeightChange(gridId) {

	let gridNumberOfRow = 0;
	let gridOneRowHeight = 0;
	let gridPageMiddleHeight = 0;

	let selector = $(gridId).find('.dx-data-row');
	if (selector.length > 0) {
		gridOneRowHeight = selector.eq(0).outerHeight(true) + 0.5;
	} else {
		$(gridId).dxTreeList("instance").pageSize(1);
		return;
	}

	selector = $(gridId).find('.dx-treelist-rowsview').find('div:eq(0)');
	gridPageMiddleHeight = selector.outerHeight(true) - 1;

	if (gridOneRowHeight === 0) gridNumberOfRow = 10;
	else gridNumberOfRow = Math.floor((gridPageMiddleHeight) / gridOneRowHeight);

	if (gridNumberOfRow <= 0) gridNumberOfRow = 1;

	$(gridId).dxTreeList("instance").pageSize(gridNumberOfRow);
}
