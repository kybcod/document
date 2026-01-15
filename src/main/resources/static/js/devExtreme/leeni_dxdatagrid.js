/*******************************************************
 저작권 : COPYRIGHTⓒ 2023 leenicoms.
 작성일자: 2023.02.01
 작성자: martino
 파일내용: devextreme datagrid wrapper library
 주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
 주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
 주3) event callback은 overloading하여 사용
 변경이력:
 -. 2023.02.01 최초 작성
 ********************************************************/

//resize가 반복적으로 일어나면 화면 반응이 늦어지므로 timeout 사용
$(window).resize(function () {
	//resize시에 grid가 줄어들면 화면이 넘어가는 현상이 있으므로 resizeing 발생시에 row=1로 setting
	if (this.resizeTo) {
		clearTimeout(this.resizeTo);
	}

	this.resizeTo = setTimeout(function () {
		$(this).trigger('resizeEnd');
	}, 500);
});

//resize가 더이상 일어나지 않으면 event 발생시킴
$(window).on('resizeEnd', function () {
	//grid의 높이를 계산
	for (const autoGrid of $(".set-auto-paging:visible")) {
		let autoGridId = `#${$(autoGrid).attr("id")}`;
		autoGridId === '#menu_mamt_grid'?dxTreeListHeightChange(autoGridId):GridHeightChange(autoGridId); //TODO 메뉴 아이디가 아닌 dxgrid 구분할 수 있는 구분자(dxDataGrid,dxTreeList 등) 로 변경해야함
	}
	//grid의 number of rows를 계산

});

function dxdatagrid() {

	this.dataSource = [];
	this.allowColumnResizing = true;         //column width resizing enable
	this.columnAutoWidth = false;            //column auto width
	this.columnResizingMode = 'widget';       //column resizing ※) nextColumn or widget

	this.showColumnLines = true;            //show column line
	this.showRowLines = true;               //show row line
	this.showBorders = true;               //Specifies whether the outer borders of the UI component are visible.
	this.hoverStateEnabled = true;

	// 2024.06.25 Peter modified. function(e) 를 화살표 함수로 변경함. this.cellVerticalAlign 사용을 가능하게 하기 위해서.....
	this.onCellPrepared = (e) => {
		dxDataGridRowSpan(e);
		// 2024.06.25 Peter Added.
		e.cellElement.css({
			"vertical-align": `${this.cellVerticalAlign}`,
			"font-size": "16px",
			"height": "26px",
			"line-height": "26px"
		});
		e.cellElement.attr('title', e.value);
	};

	this.paging = {
		enabled: true,	//페이징 처리를 사용하고 싶지 않으면 세팅하기전에 pagingEnabled: false주면 됨
		pageSize: 30
	};
	this.sorting = {
		mode: 'multiple'
	};
	this.noDataText = "조회된 데이터가 없습니다."
	this.toolbar = {};
	this.option = {};
	this.editing = {};
	this.onCellClick = {};
	this.onRowClick = {};
	this.selection = {
		mode: 'single',
		selectAllMode: 'page'
	};
	this.searchPanel = {
		highlightSearchText: false
	};
	this.columns = [];
	this.pager = {
		//		displayMode: "full",
		visible: true,
		showNavigationButtons: true
	};
	// 2024.06.25 Peter Added. devextream dxDataGrid 의 기본값도 top 으로 설정되어 있음.
	this.cellVerticalAlign = "top";

	this.filterRow = {
		visible: false
	}

	this.loadPanel =  {
		enabled: true
	};
}

/*
초기 데이터? -> 해당그리드.getDataSource()._store._array

for(const source of distributeGrid[0].getDataSource()._store._array){
}
*/
// 2024.06.25 Peter Added.
dxdatagrid.prototype.setCellVerticalAlign = function (align) {
	this.cellVerticalAlign = align;
};

// 2024.06.25 Peter Added.
dxdatagrid.prototype.setCellVerticalAlign = function (align) {
	this.cellVerticalAlign = align;
};

// paging 처리시 페이지의 버튼을 그려줄지 여부
// mode 'auto', true, false
dxdatagrid.prototype.setPager = function (mode) {
	this.pager.visible = mode;
};


/**
 * datagrid의 data source를 지정 = server에서 받아온 data를 넣어준다.
 */
dxdatagrid.prototype.setDataSource = function (dataSource) {
	this.dataSource = dataSource;
};

/**
 * datagrid의 data key 값을 지정, key값으로 CRUD기능 처리한다.
 */
dxdatagrid.prototype.setKeyExpr = function (keyExpr) {
	this.keyExpr = keyExpr;
	// customDataSource 를 위한 키처리
	if (this.dataSource && this.dataSource.load) this.dataSource._key = keyExpr;
};


/**
 * datagrid의 모드 설정
 * grid의 mode를 설정하고 추가, 수정, 삭제 기능 사용여부를 결정한다.
 * data type은 String, boolean, boolean, boolean이다. ex) mode = 'popup'; allowAdding = true; allowUpdating = true; allowDeleting = true;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/
 */
dxdatagrid.prototype.setEditing = function (mode, allowAdding, allowUpdating, allowDeleting) {
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/#mode
	//Accepted Values: 'batch' | 'cell' | 'row' | 'form' | 'popup'
	this.editing.mode = mode;
	this.editing.texts = {};
	this.editing.popup = {};
	this.editing.loadPanel = {};
	this.editing.form = {};
	this.editing.allowAdding = allowAdding;
	this.editing.allowUpdating = allowUpdating;
	this.editing.allowDeleting = allowDeleting;
	this.editing.loadPanel.enabled = true;
	this.editing.useIcons = true;
};

/**
 * 추가,수정,삭제 관련 UI 요소에 대한 텍스트를 지정하는 속성을 포함한다.
 * data type은 String, String이다. ex) deleteTitle = '게시글'; deleteMsg = '삭제하시겠습니까?';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/editing/texts/
 */
dxdatagrid.prototype.setEditingTexts = function (deleteTitle, deleteMsg) {
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
dxdatagrid.prototype.setEditingPopup = function (title, width, height) {
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
dxdatagrid.prototype.setEditingForm = function (dataField, colCount, colSpan, caption) {
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

			if (dataField[i] === 'ocryn') {
				editor.editorType = 'dxCheckBox';
				editor.editorOptions = {
					text: "OCR",
				};
				editor.defaultValue = false;
			}

			if (dataField[i] === '등록파일') {
				editor.editorType = 'dxFileUploader';
				editor.colSpan = colSpan;
				editor.editorOptions = {
					name: "files",
					selectButtonText: "파일 선택",
					labelText: "",
					multiple: true,
					accept:".doc,.docx,.txt,.xls,.xlsx,.pptx,.hwp,.gif,.jpeg,.jpg,.png,.bmp,.pdf,.tiff",
					uploadMode: "useForm",
					// 💡 아이콘 추가를 위한 onContentReady 핸들러
					onContentReady: function(e) {
						const selectButton = e.element.find('.dx-fileuploader-button');
						if (selectButton.length) {
							selectButton.dxButton('option', 'icon', 'floppy');
						}
					}
				};
			}
		}

		items.items.push(editor);
	}

	this.editing.form.items.push(items);
};


dxdatagrid.prototype.setOnInitNewRow = function(callback) {
	this.onInitNewRow = callback;
};

dxdatagrid.prototype.setOnEditingStart = function(callback) {
	this.onEditingStart = callback;
};

/**
 * datagrid의 컬럼을 지정
 * server에서 받아온 데이터 컬럼명을 넣어주면 자동으로 값이 바인딩되서 list가 그려진다.
 * data type은 배열 ex) columns = ['Prefix','FirstName','LastName','Position','StateID','BirthDate']; merges = ['FirstName','Position','BirthDate'];
 * merge할 필드가 없으면 파라미터를 안보내도 된다.
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/
 */
dxdatagrid.prototype.setColumns = function (columns, merges) {
	let push = 'N';

	columns.forEach(function (column) {
		let colConfig = { dataField: column, alignment: "center" };

		// 🔹 seq 컬럼만 읽기 전용 처리
		if (column === "seq") {
			colConfig.allowEditing = false;
		}



		if (column === "crtDt" || column === "docDt") {
			colConfig.customizeText = function(cellInfo) {
				const dateStr = cellInfo.value;
				if (typeof dateStr === "string" && dateStr.includes(" ")) {
					return dateStr.split(" ")[0];
				}
				return dateStr;
			};
		}

		// 🔹 'use' 컬럼에 라디오 버튼 에디터 적용
		if (column === "use" || column === "menuUse" || column === "isUniq" || column === "enable" || column === "userFlag") {
			colConfig.defaultValue = '1';
			colConfig.editCellTemplate = function(cellElement, cellInfo) {
				$('<div />').dxRadioGroup({
					dataSource: [
						{ text: 'Y', value: '1' },
						{ text: 'N', value: '0' }
					],
					valueExpr: "value",
					displayExpr: "text",
					value: cellInfo.value ?? '1',
					onInitialized: function(e) {
						if (cellInfo.value == null) {
							cellInfo.setValue('1');
						}
					},

					layout: 'horizontal',
					onValueChanged: function(e) {
						cellInfo.setValue(e.value);
					}
				}).appendTo(cellElement);
			};
			colConfig.cellTemplate = function(container, options) {
				const value = (options.value === '0' || options.value === 'NON_UNIQUE') ? 'N' : 'Y';
				$('<span>')
					.text(value)
					.appendTo(container);
			};
		}

    if (column === "select") {
      colConfig.dataType = "boolean";

      colConfig.editCellTemplate = function(cellElement, cellInfo) {
        $('<div />').dxCheckBox({
          value: cellInfo.value === true || cellInfo.value === 'Y',
          onValueChanged: function(e) {
            cellInfo.setValue(e.value ? 'Y' : 'N');
          }
        }).appendTo(cellElement);
      };

      colConfig.cellTemplate = function(container, options) {
        $('<div />').dxCheckBox({
          value: options.value === true || options.value === 'Y',
          onValueChanged: function(e) {
            options.data.select = e.value ? 'Y' : 'N';

            const dataGrid = options.component;
            const items = dataGrid.getDataSource().items();
            const isAllSelected = items.length > 0 && items.every(item => item.select === 'Y');

            // 헤더 체크박스 인스턴스를 찾아 값 업데이트
            const headerCheckbox = $(dataGrid.element()).find('.custom-header-checkbox').dxCheckBox('instance');
            if (headerCheckbox) {
                headerCheckbox.option('value', isAllSelected);
            }
          }
        }).appendTo(container);
      };

      colConfig.headerCellTemplate = function(header, info) {
        const dataGrid = info.component;
        const items = dataGrid.getDataSource().items();
        const isAllSelected = items.length > 0 && items.every(item => item.select === 'Y');

        $('<div>')
        .addClass('custom-header-checkbox') // 헤더 체크박스 식별용 클래스 추가
        .dxCheckBox({
          value: isAllSelected,
          onValueChanged(e) {
            // 사용자가 직접 클릭했을 때만 전체 선택/해제 로직 실행
            if (e.event) {
              e.event.stopPropagation();
              
              const currentItems = dataGrid.getDataSource().items();
              currentItems.forEach(item => {
                item.select = e.value ? 'Y' : 'N';
              });
              
              dataGrid.refresh();
            }
          }
        })
        .appendTo(header);
      };
    }
		if (column === "system") {
			colConfig.cellTemplate = function(container, options) {
				$('<a>')
					.addClass('restart-btn')
					.text('Restart')
					.attr('href', 'javascript:void(0);')
					.css('color', '#337ab7')
					.on('click', function() {
						const $btn = $(this);

						if ($btn.data('loading')) return; // 이미 로딩 중이면 무시
						$btn.data('loading', true);
						$btn.text('로딩 중…');
						$btn.css('pointer-events', 'none'); // 클릭 막기

						// AJAX 호출
						systemRestart(options.data, function() {
							$btn.data('loading', false);
							$btn.text('Restart');
							$btn.css('pointer-events', 'auto');
						});
					})
					.appendTo(container);
			};
		}

		if (column === "") {
			colConfig.cellTemplate = function(container, options) {

				// reg 버튼
				createActionLink({
					text: 'reg',
					className: 'reg-btn',
					container: container,
					styles: { 'color': '#337ab7', 'margin-right': '8px', 'cursor': 'pointer' },
					onClick: function() {
						openSourRegi(options.data);
					}
				});

				// ref 버튼
				createActionLink({
					text: 'ref',
					className: 'ref-btn',
					container: container,
					onClick: function() {
						const $btn = $(this);

						if ($btn.data('loading')) return;
						$btn.data('loading', true);
						$btn.text('로딩 중…');
						$btn.css('pointer-events', 'none');

						systemRestart(options.data, function() {
							$btn.data('loading', false);
							$btn.text('ref');
							$btn.css('pointer-events', 'auto');
						});
					}
				});

			};
		}


		if (column === "start/stop") {
			colConfig.cellTemplate = function(container, options) {

				// start 버튼
				createActionLink({
					text: 'start',
					className: 'start-btn',
					container: container,
					styles: { 'color': '#337ab7', 'margin-right': '8px', 'cursor': 'pointer' },
					onClick: function() {
						const $btn = $(this);

						if ($btn.data('loading')) return;
						$btn.data('loading', true);
						$btn.text('로딩 중…');
						$btn.css('pointer-events', 'none');

						systemStart(options.data, function() {
							$btn.data('loading', false);
							$btn.text('start');
							$btn.css('pointer-events', 'auto');
						});

					}
				});

				// stop 버튼
				createActionLink({
					text: 'stop',
					className: 'stop-btn',
					container: container,
					onClick: function() {
						const $btn = $(this);

						if ($btn.data('loading')) return;
						$btn.data('loading', true);
						$btn.text('로딩 중…');
						$btn.css('pointer-events', 'none');

						systemStop(options.data, function() {
							$btn.data('loading', false);
							$btn.text('stop');
							$btn.css('pointer-events', 'auto');
						});
					}
				});

			};
		}

		if (merges != undefined && merges.length > 0) {
			merges.forEach(function (merge) {
				if (column == merge) {
					this.columns.push({ dataField: column, allowMerge: true, alignment: "center" });
					push = 'Y';
				}
			}, this);
			if (push == 'N') {
				this.columns.push(colConfig);
			}
			push = 'N';
		} else {
			this.columns.push(colConfig);
		}
	}, this);
};


function createActionLink({ text, className, onClick, container, styles }) {
	$('<a>')
		.addClass(className)
		.text(text)
		.attr('href', 'javascript:void(0);')
		.css(styles || { 'color': '#337ab7', 'cursor': 'pointer' })
		.on('click', onClick)
		.appendTo(container);
}


dxdatagrid.prototype.setColumnsGroup = function (columns) {
	this.columns = columns;
};

// 컬럼의 검색가능 여추 세팅
dxdatagrid.prototype.setAllowSearch = function (columns) {
	for (let i = 0; i < this.columns.length; i++) {
		this.columns[i].allowSearch = false;
	}

	for (let i = 0; i < this.columns.length; i++) {
		for (const column of columns) {
			if (this.columns[i].dataField != column) continue;
			this.columns[i].allowSearch = true;
		}
	}
}

// 컬럼의 포멧 처리
// dataField는 포멧 해주는 해당 컬럼명 List로 format은 Object로 아래 주소 참조
// 참조
// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#format
// https://js.devexpress.com/Documentation/ApiReference/Common/Object_Structures/format/
dxdatagrid.prototype.setFormat = function (dataField, format) {
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].format = format;
		}
	}
}

dxdatagrid.prototype.setDataType = function (dataField, dataType) {
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].dataType = dataType;
		}
	}
}

/*
* 2025.04.28 SJK추가
* 컬럼 바로 밑에  필터를 걸 수 있도록 만들어줌
* 원하는 컬럼들을 배열에 담아 주면 해당 컬럼들만 세팅된다.
* @param []
* */

dxdatagrid.prototype.setAllowFiltering = function (columns) {
	// filterRow 보이게 설정
 this.filterRow.visible = true;

	// 전체 컬럼 allowFiltering 끄기
	for (let i = 0; i < this.columns.length; i++) {
		this.columns[i].allowFiltering = false;
	}

	// 전달받은 컬럼만 allowFiltering 켜기
	for (let i = 0; i < this.columns.length; i++) {
		for (const column of columns) {
			if (this.columns[i].dataField !== column) continue;
			this.columns[i].allowFiltering = true;
		}
	}
}


/**
 * 특정 필드 활성화/비활성화 전역 메서드
 * data type은 string 이다. ex) column = 'name';
 */
dxdatagrid.prototype.setColumnReadOnly = function(...columns) {
	this.onEditorPreparing = function(e) {
		if (e.parentType === "dataRow" && columns.includes(e.dataField)) {
			e.editorOptions.readOnly = !e.row.isNewRow;
		}
	};
};

dxdatagrid.prototype.setOnEditorPreparing = function(callback) {
	this.onEditorPreparing = callback;
};


/**
 * datagrid의 페이징 처리
 * data type은 int다. ex) pageSize = 10;
 * enabled  = boolean
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/paging/
 */
dxdatagrid.prototype.setPaging = function (pageSize) {
	this.paging = {};
	this.paging.enabled = true;
	this.paging.pageSize = pageSize;
};


// 해당 그리드의 스크롤링의 형식을 조절
// 보통 그리드끝의 데이터가 흐려져서 안보이면 이게 원인
// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/scrolling/#mode
dxdatagrid.prototype.setScrolling = function (mode) {
	/*	this.scrolling = {
			showScrollbar: "always",
	//		useNative: true,
		};*/
	this.scrolling.mode = mode;
	this.scrolling.columnRenderingMode = mode;
};

/**
 * datagrid의 행 선택 모드
 * data type은 String이다. ex) mode = 'multiple';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/selection/#mode
 * Accepted Values: 'single' | 'multiple' | 'none'
 */
dxdatagrid.prototype.setSelection = function (mode) {
	if (mode == "multiple") {
		this.selection.showCheckBoxesMode = "always";
	}
	this.selection.mode = mode;
};

/**
 * datagrid의 toolbar 생성
 * data type은 int, 2차배열, object이다.
 * ex) num = 3, btn = [['엑셀다운로드', false, false, true, 'edit', onChoiceUpdate],['삭제', false, true, true, 'trash', onChoiceDelete]]; callback = callBackToolbarOnclick;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/toolbar/
 */
dxdatagrid.prototype.setToolbar = function (num, btn, callback) {
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
			class : "custom-toolbar-button"
		};

		if (btn[i][1]) {
			items.name = 'addRowButton';
		} else {
			items.name = btn[i][0];
			items.options.onClick = btn[i][5];
		}

		if (btn[i][3]) {
			items.options.icon = btn[i][4];
		}
		this.toolbar.items.push(items);
	}
};

dxdatagrid.prototype.onClickToolbar = function (dxGrid, onEvt) {
	onEvt(dxGrid);
}
/**
 * datagrid의 cell 클릭 이벤트 처리
 * data type은 object이다. ex) onEvt = onCellClick;
 * https://js.devexpress.com/jQuery/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onCellClick
 */
dxdatagrid.prototype.setOnCellClick = function (onEvt) {
	this.onCellClick = onEvt;
};

/**
 * datagrid의 행 클릭 이벤트 처리
 * data type은 object이다. ex) onEvt = onRowClick;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onRowClick
 */
dxdatagrid.prototype.setOnRowClick = function (onEvt) {
	this.onRowClick = onEvt;
};


/**
 * datagrid의 행 더블클릭 이벤트 처리
 * data type은 object이다. ex) onEvt = onRowDblClick;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onRowDblClick
 */
dxdatagrid.prototype.setOnRowDblClick = function (onEvt) {
	this.onRowDblClick = onEvt;
};


/**
 * datagrid의 update 기능이다.
 * data type은 object이다. ex) onEvt = updateBoard;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onRowUpdating
 */
dxdatagrid.prototype.setOnRowUpdating = function (onEvt) {

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
dxdatagrid.prototype.setOnRowInserting = function (onEvt) {

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
dxdatagrid.prototype.setOnRowRemoving = function (onEvt) {

	this.onRowRemoving = function (e) {
		onEvt(e.key);
	}
};

/**
 * columns의 속성
 * 테이블 필드명 지정, caption을 지정하지않으면 server에서 받아온 컬럼으로 필드명이 표시된다.
 * data type은 배열 ex) captions = ['Title','','','','',''] 빈값은 dataField로 표시된다.
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#caption
 */
dxdatagrid.prototype.setCaptions = function (captions) {
	for (let i = 0; i < this.columns.length; i++) {
		if (!captions[i]) continue;

		this.columns[i].caption = captions[i];
	}
};

/**
 * 해당 컬럼을 2개이상의 컬럼들로 join
 * dataField는 join해서 보여줄 셀의 데이터필드명을 적어주면된다.
 * jieldList는 원하는 컬럼의 데이터필드명을 리스트형식으로 받는다.
 * dateType은 해당 join할 컬럼들이 date값으로 표시하고싶다면 예) [2023,04,13,11,30,20] => 2023-04-13 11:30:20
 * 해당 매개변수에 date면 DATE datetime이면 DATETIME time이면 TIME으로 적어준다.
 * 단 date값으로 표시할 때 데이터필드를 [년,월,일,시간,분,초] 형식으로 받아와야한다. 차례대로 있으면 뒤의 필드는 필요없지만
 * 뒤의 필드만 필요하면 앞의 필드도 빈값으로라도 넣어야함
 */
/**
 * dateType = 받아올 데이터 형식 예)년월일시분초"yyyy MM dd HH mm ss" 년월일"yyyy MM dd" 시분초"HH mm ss"
 * dateFormat = 날짜형식을 포멧형식으로 변경 예) "yyyy/MM/dd HH:mm:ss" => 2023/04/14 13:14:02
 * charFormat = 날짜형식이아닌, 문자열로 포멧할 시 사용한다. 우선순위는 dateFormat에 있고, fieldList.length가 2일때만 동작한다. 예) ['(',')'] => char(char2)
 */
dxdatagrid.prototype.setCalculateCellValue = function (dataField, fieldList, dateType, dateFormat, charFormat) {
	for (let i = 0; i < this.columns.length; i++) {
		if (this.columns[i].dataField != dataField) continue;
		this.columns[i].calculateCellValue = function (e) {
			let times = "";
			let resultList = [];
			let result = "";
			for (let i = 0; i < fieldList.length; i++) {
				for (let j = 0; j < Object.keys(e).length; j++) {
					if (fieldList[i] == Object.keys(e)[j]) {
						resultList.push(e[fieldList[i]]);
					}
				}
			}
			result = resultList.join(" ");
			if (dateType) {
				times = DevExpress.localization.parseDate(result, dateType);
				return DevExpress.localization.formatDate(times, dateFormat);
			}

			if (charFormat && fieldList.length == 2) {
				return resultList[0] + charFormat[0] + resultList[1] + charFormat[1];
			}

			return result;
		};
	}
};

/**
 * datagrid의 alignment 설정
 * grid의 alignment를 설정한다.
 * data type은 String, String이다. ex) dataField = 'ID', width = 'center';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#alignment
 * Accepted Values: undefined | 'center' | 'left' | 'right'
 */
dxdatagrid.prototype.setAlignment = function (dataField, alignment) {
	for (let i = 0; i < this.columns.length; i++) {
		if (this.columns[i].dataField != dataField) continue;

		this.columns[i].alignment = alignment;
	}
};

/**
 * datagrid의 alignment 설정
 * grid의 alignment를 설정한다.
 * data type은 String, String이다. ex) dataField = ['ID','PWD'], width = 'center';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#alignment
 * Accepted Values: undefined | 'center' | 'left' | 'right'
 */
dxdatagrid.prototype.setCommonAlignment = function (dataField, alignment) {
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].alignment = alignment;
		}
	}
};

/**
 * 다중헤더 그리드의 alignment 설정
 * grid의 alignment를 설정한다.
 * data type은 String, String이다. ex) dataField = ['ID','PWD'], width = 'center';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#alignment
 * Accepted Values: undefined | 'center' | 'left' | 'right'
 */
dxdatagrid.prototype.setMultiCommonAlignment = function (dataField, alignment) {
	for (let i = 0; i < this.columns.length; i++) {
		if (this.columns[i].dataField) {
			for (const dataFieldElement of dataField) {
				if (this.columns[i].dataField != dataFieldElement) continue;
				this.columns[i].alignment = alignment;
			}
		} else {
			for (let j = 0; j < this.columns[i].columns.length; j++) {
				if (this.columns[i].columns[j].dataField) {
					for (const dataFieldElement of dataField) {
						if (this.columns[i].columns[j].dataField != dataFieldElement) continue;
						this.columns[i].columns[j].alignment = alignment;
					}
				} else {
					for (let k = 0; k < this.columns[i].columns[j].length; k++) {
						for (const dataFieldElement of dataField) {
							if (this.columns[i].columns[j].columns[k].dataField != dataFieldElement) continue;
							this.columns[i].columns[j].columns[k].alignment = alignment;
						}
					}
				}
			}
		}
	}
};

/**
 * columns의 속성
 * input태그 placeholder 지정한다.
 * data type은 String이다. ex) text = 'ID'
 */
dxdatagrid.prototype.setPlaceholder = function (text) {
	for (let i = 0; i < this.columns.length; i++) {
		if (!text[i]) continue;

		this.columns[i].placeholder = text[i];
	}
};

/**
 * columns의 속성인 validationRules의 속성
 * 빈값 체크, 컬럼의 필수항목입력으로 지정하여 검증하는 함수
 * data type은 String, String, String, String또는int 이다. ex) dataField = 'ID',type = 'required', message = '아이디를 입력해주세요.', param = 10
 * param은 추가 속성으로 max,pattern 등의 값을 넣어준다.
 * Type: Array<RequiredRule | NumericRule | RangeRule | StringLengthRule | CustomRule | CompareRule | PatternRule | EmailRule | AsyncRule>
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#validationRules
 */
dxdatagrid.prototype.setValidationRules = function (dataField, type, message, param) {
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
			case 'range':
				// param: { min: number, max: number }
				validation.min = param.min;
				validation.max = param.max;
				break;
		}

		validation.type = type;
		validation.message = message;
		array.push(validation);
		this.columns[i].validationRules = array;
	}
};

/**
 * datagrid의 width 설정
 * grid의 width를 설정한다.
 * data type은 String, int이다. ex) dataField = 'ID', width = 130;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#width
 */
dxdatagrid.prototype.setWidth = function (dataField, width) {
	for (let i = 0; i < this.columns.length; i++) {
		if (this.columns[i].dataField != dataField) continue;

		this.columns[i].width = width;
	}
};

/**
 * datagrid의 width 설정의 매개변수를 List만으로 작성할수있게 만든 함수
 * grid의 width를 설정한다.
 * widthList = 전체 컬럼에 대한 Width를 List로 준다.
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#width
 */
dxdatagrid.prototype.setWidthList = function (widthList) {
	for (let i = 0; i < this.columns.length; i++) {
		if (i >= widthList.length) return;
		this.columns[i].width = widthList[i];
	}
};


// 그리드의 셀이 만들어졌을때 해당 셀에 관한 이벤트를 발생
dxdatagrid.prototype.setOnCellPrepared = function (onEvt) {
	if (this.onCellCustomizeFnc) {
		// 2024.06.25 Peter modified. function(e) 를 화살표 함수로 변경함. this.cellVerticalAlign 사용을 가능하게 하기 위해서.....
		this.onCellPrepared = (e) => {
			dxDataGridRowSpan(e);
			// 2024.06.25 Peter Added.
			e.cellElement.css({ "vertical-align": `${this.cellVerticalAlign}` });
			onEvt(e);
			cellCustomizeFormat = "onCellPrepared";
			e.component.option().onCellCustomizeFnc(e, e);
		};
	} else {
		this.onCellPrepared = (e) => {
			dxDataGridRowSpan(e);
			// 2024.06.25 Peter Added.
			e.cellElement.css({ "vertical-align": `${this.cellVerticalAlign}` });
			onEvt(e);
		};
		this.onCellPreparedOrigin = (e) => {
			dxDataGridRowSpan(e);
			// 2024.06.25 Peter Added.
			e.cellElement.css({ "vertical-align": `${this.cellVerticalAlign}` });
			onEvt(e);
		};
	}

};

dxdatagrid.prototype.setOnRowPrepared = function (onEvt) {
	this.onRowPrepared = onEvt;
}


// 그리드의 RowLine을 그려줄지의 여부
// type = boolean
dxdatagrid.prototype.setShowRowLines = function (rowLines) {
	this.showRowLines = rowLines;
}

// 그리드의 헤더를 그려줄지의 여부
// showHeader = boolean
dxdatagrid.prototype.setShowColumnHeader = function (showHeader) {
	this.showColumnHeaders = showHeader;
}

// 그리드의 테두리를 그려줄지의 여부
// border = boolean
dxdatagrid.prototype.setShowBorders = function (border) {
	this.showBorders = border;
}

// 마우스 hover 색변환 옵션 설정
// type = boolean
dxdatagrid.prototype.setHoverStateEnabled = function (type) {
	this.hoverStateEnabled = type;
}


// 다중헤더
// mid 없어도됨
dxdatagrid.prototype.setColumnSetting = function (sinCap, sinData, big, mid, sml, data, rule, endCap, endData) {
	if (sinCap) {
		for (let i = 0; i < sinCap.length; i++) {
			//this.columns.push({caption: sinCap[i], dataField: sinData[i], alignment: 'center'});
			this.columns.push({ caption: sinCap[i], dataField: sinData[i], alignment: 'right' });
		}
	}
	let ruleLength = 0;
	let j = 0;
	for (let i = 0; i < rule.length; i++) {
		ruleLength += rule[i];

		//this.columns.push({caption: big[i],alignment: 'center', columns: []});
		this.columns.push({ caption: big[i], alignment: 'right', columns: [] });

		if (mid) {
			for (j; j < ruleLength; j++) {
				if (mid[j] == '') {
					//this.columns[i+sinCap.length].columns.push({caption: sml[j],alignment: 'center', dataField: data[j]});
					this.columns[i + sinCap.length].columns.push({ caption: sml[j], dataField: data[j], alignment: 'right' });
				} else {
					//this.columns[i+sinCap.length].columns.push({caption: mid[j],alignment: 'center', columns: [{caption: sml[j],alignment: 'center', dataField: data[j]}]});
					this.columns[i + sinCap.length].columns.push({ caption: mid[j], alignment: 'right', columns: [{ caption: sml[j], alignment: 'right', dataField: data[j] }] });
				}
			}
		} else {
			for (j; j < ruleLength; j++) {
				//this.columns[i+sinCap.length].columns.push({caption: sml[j],alignment: 'center', dataField: data[j]});
				this.columns[i + sinCap.length].columns.push({ caption: sml[j], alignment: 'right', dataField: data[j] });
			}
		}
	}
	if (endCap) {
		for (let i = 0; i < endCap.length; i++) {
			//this.columns.push({caption: endCap[i], dataField: endData[i], alignment: 'center'});
			this.columns.push({ caption: endCap[i], dataField: endData[i], alignment: 'right' });
		}
	}
};

// 컬럼 초기화용
dxdatagrid.prototype.setColumnsReset = function () {
	this.columns = [];
}

/**
 * 합계/ 평균값을 구하기위한 마지막줄을 만들기위한 세팅 매개변수는 모두 list로 받는다.
 * type은 summaryType으로 count: 갯수, sum: 합계, max: 최대, min: 최소, avg: 평균 값을 정한다.
 * texts는 해당 타입을 표시할때 추가로 붙는 글자를 나타낸다 예) 'count={0}개' => count=18개 형식으로 출력
 */
dxdatagrid.prototype.setSummarySetting = function (type, texts) {
	this.summary = {};
	this.summary.texts = {};
	this.summary.totalItems = [];
	if (type.length == texts.length) {
		for (let i = 0; i < type.length; i++) {
			this.summary.texts[type[i]] = texts[i];
		}
	}
}

// 합계/ 평균값 구할때 null 및 undefiend 값을 건너뛸지의 여부
dxdatagrid.prototype.setSummarySkipEmptyValues = function (boolean) {
	this.summary.skipEmptyValues = boolean;
}

/**
 * 합계/ 평균값적용할 컬럼선택 및 타입 지정
 * columns는 리스트형식으로 적용할 컬럼의 데이터필드값을 리스트로 적용
 * type은 적용할 컬럼의 타입을 지정 [count: 갯수, sum: 합계, max: 최대, min: 최소, avg: 평균]
 * 해당 항목을 사용하려면 setSummarySetting을 먼저 지정해줘야한다.
 * Fix는 소수점 반올림 소수점
 * text는 뒤에 붙일 text
 * 단 Fix먹이면 texts안먹힘
 *
 * 2025.04.11 SJK추가
 * 값들을 직접 수정해서 사용하고 싶다면
 * customizeText() 로직을 직접 작성 할 수 있도록 변경함
 * 예시)
 * {
 * 		columns: ['employeeName'],
 * 		type: "avg",
 *    customizeText: function(data) {
 *    return "평균값: " + (data.value !== undefined ? data.value.toFixed(2) : ""); // 평균값에 "평균값: " 텍스트 추가 및 소수점 2자리까지 표시
 * }
 *
 *
 */
dxdatagrid.prototype.setTotalItems = function (columns, type, Fix, text, customizeText) {
	if (!this.summary) this.summary = {};
	if (!this.summary.totalItems) this.summary.totalItems = [];

	for (let i = 0; i < columns.length; i++) {
		const summaryItem = {
			column: columns[i],
			summaryType: type
		};

		if (customizeText && typeof customizeText === 'function') {
			summaryItem.customizeText = customizeText; // 사용자 정의 customizeText 우선 적용
		} else if (Fix != undefined && Fix != null) {
			summaryItem.customizeText = function (data) {
				let value = data.value;
				if (typeof value === 'number' && !isNaN(value)) {
					value = value.toFixed(Fix);
					value = floatComma(value, Fix);
				} else {
					value = data.value; // 숫자가 아니면 그대로 반환
				}
				return text ? value + text : value;
			};
		}

		this.summary.totalItems.push(summaryItem);
	}
};

/**
 * 합계/ 평균값 컬럼에 특정 텍스트를 넣기위한 항목
 * column은 해당 컬럼의 데이터필드(column)값이고 text는 넣을 텍스트문자열이다.
 */
dxdatagrid.prototype.setSummaryCustomize = function (column, text) {
	for (let i = 0; i < this.summary.totalItems.length; i++) {
		if (this.summary.totalItems[i].column != column) continue;

		this.summary.totalItems[i].customizeText = function (data) {
			return text;
		};
	}
}

//각 행별 음영처리
// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#rowAlternationEnabled
dxdatagrid.prototype.setRowAlternationEnabled = function (bl) {
	this.rowAlternationEnabled = bl;
}

// 헤더정렬 single,muliple,none
dxdatagrid.prototype.setSortingMode = function (mode) {
	this.sorting = {
		mode: mode
	};
}

// setColumnSetting 으로 컬럼세팅한 컬럼 width세팅
dxdatagrid.prototype.setColumnWidthSetting = function (sinWidth, mid, width, rule, endWidth) {
	if (sinWidth) {
		for (let i = 0; i < sinWidth.length; i++) {
			this.columns[i].width = sinWidth[i];
		}
	}
	let ruleLength = 0;
	let j = 0;
	for (let i = 0; i < rule.length; i++) {
		ruleLength += rule[i];
		if (mid) {
			let y = 0;
			for (j; j < ruleLength; j++) {
				if (width[j] != "") {
					if (mid[j] == '') {
						this.columns[i + sinWidth.length].columns[y].width = width[j]
					} else {
						this.columns[i + sinWidth.length].columns[y].columns[0].width = width[j];
					}
				}
				y++;
			}
		} else {
			let y = 0;
			for (j; j < ruleLength; j++) {
				if (width[j] != "") {
					this.columns[i + sinWidth.length].columns[y].width = width[j];
				}
				y++
			}
		}
	}
	if (endWidth) {
		for (let i = 0; i < endWidth.length; i++) {
			this.columns[i + sinWidth.length + rule.length].width = endWidth[i];
		}
	}
};

// setColumnSetting 으로 컬럼세팅한 컬럼 width세팅
dxdatagrid.prototype.setColumnMinWidthSetting = function (sinWidth, mid, width, rule, endWidth) {
	if (sinWidth) {
		for (let i = 0; i < sinWidth.length; i++) {
			this.columns[i].minWidth = sinWidth[i];
		}
	}
	let ruleLength = 0;
	let j = 0;
	for (let i = 0; i < rule.length; i++) {
		ruleLength += rule[i];
		if (mid) {
			let y = 0;
			for (j; j < ruleLength; j++) {
				if (width[j] != "") {
					if (mid[j] == '') {
						this.columns[i + sinWidth.length].columns[y].minWidth = width[j]
					} else {
						this.columns[i + sinWidth.length].columns[y].columns[0].minWidth = width[j];
					}
				}
				y++;
			}
		} else {
			let y = 0;
			for (j; j < ruleLength; j++) {
				if (width[j] != "") {
					this.columns[i + sinWidth.length].columns[y].minWidth = width[j];
				}
				y++;
			}
		}
	}
	if (endWidth) {
		for (let i = 0; i < endWidth.length; i++) {
			this.columns[i + sinWidth.length + rule.length].minWidth = endWidth[i];
		}
	}
};

// 전체적인 컬럼의 최소width값을 지정
dxdatagrid.prototype.setColumnMinWidth = function (minWidth) {
	this.columnMinWidth = minWidth;
};

// 해당 컬럼의 최소 width값을 지정
// dataField는 배열로
dxdatagrid.prototype.setMinWidth = function (dataField, minWidth) {
	for (let i = 0; i < this.columns.length; i++) {
		for (const dataFieldElement of dataField) {
			if (this.columns[i].dataField != dataFieldElement) continue;
			this.columns[i].minWidth = minWidth;
		}
	}
};

// 모든 컬럼의 최소 width값을 지정
// widthList는 배열로
dxdatagrid.prototype.setMinWidthList = function (widthList) {
	for (let i = 0; i < this.columns.length; i++) {
		this.columns[i].minWidth = widthList[i];
	}
};

dxdatagrid.prototype.setColumnAutoWidth = function (autoWidth) {
	this.columnAutoWidth = autoWidth;
}


/**
 * 엑셀 내보내기
 *
 * devGrid객체.exportToExcel()로 호출가능
 *
 * 매개변수인 obj는 객체데이터로 헤더의 데이터와 파일 이름을 넣어준다
 * obj.name = 저장될 파일 이름,
 * obj.header = 헤더의 데이터객체
 * -> obj.header.name = 헤더 제목
 * -> obj.header.row = 헤더의 merge하는 row수
 * obj.option = 엑셀 표 설명의 관한 내용을 바인딩 해줄수 있는 옵션, 리스트로 받아온다.
 * -> 이중 리스트로 받아와 row 와 col을 세팅
 * 예) option = [["옵션1",1,2],["옵션2",3,4],["옵션3",5,6]]
 * -> 옵션1 | 1 | 2
 * 	  옵션2 | 3 | 4
 * 	  옵션3 | 5 | 6
 *
 * 매개변수인 customFunc은 엑셀 셀을 커스터마이징 할때 쓸 함수를 넣어준다.
 * 함수의 매개변수는 gridCell,excelCell으로
 * 		gridCell은 해당 cell에 넣어줄 grid의 정보를 담고있고
 * 		excelCell은 해당 cell을 그려줄 excel의 데이터다.
 * 예) dataGrid.setExport({
 *			name: "매장안내",
 *			header: {
 *				name: "매장안내",
 *				row: 2,
 *			}
 *		},function(gridCell,exportCell,format){
 *			if(format === "pdf"){
 *				if(gridCell.rowType != "data") return;
 *				if(gridCell.column.name == "IMPROVE_TYPE"){
 *					if(gridCell.data.IMPROVE_TYPE == "1"){
 *						exportCell.text = "제안 및 개선사항";
 *					}else{
 *						exportCell.text = "장애";
 *					}
 *
 *				}
 *			}else if(format === "xlsx"){
 *				if(gridCell.rowType != "data") return;
 *				if(gridCell.column.name == "IMPROVE_TYPE"){
 *					if(gridCell.data.IMPROVE_TYPE == "1"){
 *						exportCell.value = "제안 및 개선사항";
 *					}else{
 *						exportCell.value = "장애";
 *					}
 *					excelCell._column.width = sizeCheck;
 *				}
 *			}
 *		});
 */

/*
	23.11.22
	exportGridToFormat(그리드객체,'xlsx');	-> 엑셀로 다운로드
	exportGridToFormat(그리드객체,'pdf');		-> pdf로 출력기능
*/

dxdatagrid.prototype.setExport = function (obj, customFunc) {
	this.export = {},
		this.export.enabled = false,
		this.export.option = obj.option;
	this.export.formats = ['xlsx', 'pdf'];
	this.onExporting = function (e) {
		/*if (!e.component.getDataSource()._items.length) {
			basicAlert({ icon: 'error', title: "", text: '조회된 데이터가 없습니다.' });
			return;
		}*/
		//pdf(출력기능)
		if (e.format === "pdf") {

			window.jsPDF = window.jspdf.jsPDF;

			const doc = new jsPDF({
				orientation: "l", // p: 가로(기본), l: 세로
				unit: "mm", // 단위 : "pt" (points), "mm", "cm", "m", "in" or "px" 등)
				format: "a4", // 포맷 (페이지 크기).
			});

			doc.addFileToVFS('malgun.ttf', malgun_fonts); //malgun_fonts 변수는 Base64 형태로 변환된 내용, 내용이 너무 길어 외부 파일로 따로 관리
			doc.addFont('malgun.ttf', 'malgun', 'normal');
			doc.setFont('malgun');

			//추가옵션 영역 높이
			let option_height = e.component.option("export.option") ? e.component.option("export.option").length * 6 : 0;

			let option_x = 0;

			DevExpress.pdfExporter.exportDataGrid({
				jsPDFDocument: doc,
				component: e.component,
				topLeft: { x: 1, y: 8 + option_height },	//그리드영역의 시작위치
				// indent: 5,
				customizeCell({ gridCell, pdfCell }) {

					//개행문자 삭제
					if (pdfCell.text) {
						pdfCell.text = pdfCell.text.replaceAll("\r", "");
						pdfCell.text = pdfCell.text.replaceAll("\n", "");
					}

					pdfCell.font.size = 7;
					if (gridCell.rowType === 'data') {

					} else if (gridCell.rowType === 'header') {
						pdfCell.backgroundColor = 'E2ECFD';
						pdfCell.textColor = '000000';
					}

					// 공통 커스터마이징 함수가 있을때
					if (e.component.option("onCellCustomizeFnc")) {
						cellCustomizeFormat = "pdf";
						e.component.option().onCellCustomizeFnc(gridCell, pdfCell);
					}

					if (customFunc) {
						customFunc(gridCell, pdfCell, "pdf");
					}
				}, customDrawCell(e) {
					if (option_x !== 0) return;
					option_x = e.rect.x;
				}

			}).then(() => {
				const pageWidth = doc.internal.pageSize.getWidth();
				doc.setFontSize(15);
				const headerWidth = doc.getTextDimensions(obj.header.name).w;
				doc.setPage(1);
				doc.text(obj.header.name, (pageWidth - headerWidth) / 2, 15);

				doc.addImage(base64Logo, 'PNG', 5, 5, 23, 8)

				if (e.component.option("export.option")) {
					// option 스타트 y좌표
					let option_y = 5;

					doc.setFontSize(8);
					e.component.option("export.option").forEach((row1) => {
						let columnWidths = option_x;
						row1.forEach((cell, index) => {
							let textWidth = 0;
							for (const row2 of e.component.option("export.option")) {
								if (index > row2.length) continue;
								let rowSize = doc.getTextDimensions(row2[index]).w + 5;	//옵션의 넓이
								if (textWidth < rowSize) {
									textWidth = rowSize;
								}
							};
							doc.setFillColor("#f2f2f2");
							doc.setTextColor(0, 0, 0);
							doc.text(cell, columnWidths, 20 + option_y);	//왼쪽정렬
							//						doc.text(cell, columnWidths + (textWidth - doc.getTextDimensions(cell).w), 20 + option_y);			//가운데정렬
							//					    doc.text(cell, columnWidths + (textWidth - doc.getTextDimensions(cell).w) / 2, 20 + option_y );		//오른쪽정렬
							columnWidths += textWidth;
						});
						option_y += 5;
					});
				}

				// 추가적인 영역을 인쇄해야 할 때 2025.04.16 SJK
				if(e.exportParams){
					html2canvas(document.getElementById(e.exportParams.additionalDiv), {//추가 영역
						scale: 1, //  확대율 적당히 (기본: 1, 전에 2였으면 너무 작아짐)
						useCORS: true,
						allowTaint: false,
						ignoreElements: el => el.tagName === 'IMG' // ❗️이미지 에러 방지
					}).then(canvas => {
						const imgData = canvas.toDataURL("image/png");

						// PDF 좌표 기준으로 출력 위치 조정
						const imageX = 15;
						const imageY = 150; //  여기를 상황에 맞게 조절

						const imageWidth = 270; // A4 가로 - 마진
						const imageHeight = canvas.height * (imageWidth / canvas.width); // 비율 유지

						doc.addImage(imgData, 'PNG', imageX, imageY, imageWidth, imageHeight);

						doc.autoPrint();
						const blob = doc.output("blob");
						window.open(URL.createObjectURL(blob));

					});
					return;
				}

				// PDF 출력
				doc.autoPrint();		// 인쇄창 열림
				//window.open(doc.output('bloburl', {filename: 'test.pdf'}));
				var blob = doc.output("blob");
				window.open(URL.createObjectURL(blob));
				//doc.output('dataurlnewwindow');
				//doc.save('Companies.pdf');

			});

		}

		//	엑셀
		else if (e.format === "xlsx") {

			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet('CountriesPopulation');

			let topLeftCellRow = e.component.option("export.option") ? obj.header.row + 3 + e.component.option("export.option").length : obj.header.row + 2;

			DevExpress.excelExporter.exportDataGrid({
				component: e.component,
				worksheet,
				customizeCell(options) {
					const { gridCell } = options;
					const { excelCell } = options;
					if (gridCell.rowType === 'data') {
						// 통계 색변경
						//if (gridCell.value == '101') excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8ECEC' } };

					} else if (gridCell.rowType === 'header') {//헤더(th)부분 색
						excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2ECFD' } };
					}

					// 공통 커스터마이징 함수가 있을때
					if (e.component.option("onCellCustomizeFnc")) {
						cellCustomizeFormat = "xlsx";
						e.component.option().onCellCustomizeFnc(gridCell, excelCell);
					}

					//엑셀쪽 커스터마이징 된 함수가 있을때
					if (customFunc) {
						customFunc(gridCell, excelCell, "xlsx");
					}
				},
				topLeftCell: { row: topLeftCellRow, column: 1 },
			}).then((cellRange) => {
				const excelImage = workbook.addImage({
					base64: base64Logo,
					extension: 'png',
				});


				const headerImage = worksheet.getRow(1);
				headerImage.height = 40;
				worksheet.addImage(excelImage, {
					tl: { col: 0, row: 0 },
					br: { col: 1, row: 1 },
				});

				// header
				const headerRow = worksheet.getRow(2);
				headerRow.height = 30;

				// column의 갯수만큼 제목크기설정
				let header_column = 0;
				for (const cell_length of worksheet._rows) {
					if (!cell_length) continue;
					if (!cell_length._cells) continue;
					if (cell_length._cells.length > header_column) {
						header_column = cell_length._cells.length;
					}
				}

				//엑셀파일의 제목부분
				worksheet.mergeCells(2, 1, obj.header.row, header_column);
				headerRow.getCell(1).value = obj.header.name;
				headerRow.getCell(1).font = { name: 'Segoe UI Light', size: 22 };
				headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
				headerRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2ECFD' } };

				// option 작성
				if (e.component.option("export.option")) {
					let option_length = 0;
					// option 갯수 카운팅
					for (let i = 0; i < e.component.option("export.option").length; i++) {
						if (e.component.option("export.option")[i].length > option_length) option_length = e.component.option("export.option")[i].length;
					}
					for (let i = 0; i < e.component.option("export.option").length; i++) {
						const optionRow = worksheet.getRow(obj.header.row + 2 + i);

						// 컬럼 갯수가 option 최대길이보다 많으면 우측정렬
						for (let j = 0; j < e.component.option("export.option")[i].length; j++) {
							// 좌측정렬
							let cell_index = j + 1;
							// 우측정렬
							if (header_column > option_length) {
								cell_index = header_column - option_length + j + 1;
							}
							// option의 셀 속성
							optionRow.getCell(cell_index).font = { bold: true };
							/*optionRow.getCell(cell_index).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2ECFD' } };*/
							optionRow.getCell(cell_index).value = e.component.option("export.option")[i][j];
							optionRow.getCell(cell_index).alignment = { vertical: 'middle', horizontal: 'center' };
						}
					}
				}

				// grid

				/*worksheet.mergeCells(obj.header.row + 1, 1, obj.header.row + 1, 2);*/

				/*			// footer
							const footerRowIndex = cellRange.to.row + 2;
							const footerRow = worksheet.getRow(footerRowIndex);
							worksheet.mergeCells(footerRowIndex, 1, footerRowIndex, 8);
			
							footerRow.getCell(1).value = 'www.wikipedia.org';
							footerRow.getCell(1).font = { color: { argb: 'BFBFBF' }, italic: true };
							footerRow.getCell(1).alignment = { horizontal: 'right' };*/

				//  추가 DIV 영역 삽입
				if (e.exportParams && e.exportParams.additionalDiv) {
					return html2canvas(document.getElementById(e.exportParams.additionalDiv), {
						scale: 1,  // 이미지 해상도: 너무 크면 용량 커짐, 너무 작으면 품질 저하됨
						useCORS: true,
						allowTaint: false,
						ignoreElements: el => el.tagName === 'IMG',
					}).then((canvas) => {
						//  캡처된 canvas를 base64 PNG 이미지로 변환
						const imgData = canvas.toDataURL("image/png");

						//  ExcelJS에 이미지 등록 (workbook에 추가)
						const imageId = workbook.addImage({
							base64: imgData,
							extension: 'png',
						});
						//이미지 위치 지정 후 worksheet에 삽입
						worksheet.addImage(imageId, {
							tl: { col: 0, row: cellRange.to.row + 1 }, // 이미지 시작 좌표 (왼쪽 위) → 데이터 끝 아래에서 1줄 띄움
							br: { col: 8, row: cellRange.to.row + 20 }, // 이미지 끝 좌표 (오른쪽 아래) → 크기 조정 (행/열 기준)
							editAs: 'oneCell',
						});

					}).then(() => {
						return workbook.xlsx.writeBuffer().then((buffer) => {
							saveAs(new Blob([buffer], { type: 'application/octet-stream' }), obj.name + '.xlsx');
						});
					});
				}

				// 기본 저장 처리
				return workbook.xlsx.writeBuffer().then((buffer) => {
					saveAs(new Blob([buffer], { type: 'application/octet-stream' }), obj.name + '.xlsx');
				});
			});

			e.cancel = true;
		}
	};
}
/**
 * 예) dataGrid.setExport(fileName, [{
 * 			name: "매장안내",
 * 			id: "gridTable",
 * 			header: {
 * 				name: "매장안내",
 * 				row: 2,
 * 			},
 * 			option: []
 * 		}, {
 * 			name: "매장안내2",
 * 			id: "gridTable2",
 * 			header: {
 * 				name: "매장안내2",
 * 				row: 2,
 * 			},
 * 			option: []
 * 		}],function(gridCell,exportCell,format){
* 			if(gridCell.rowType != "data") return;
* 			if(gridCell.column.name == "IMPROVE_TYPE"){
* 				if(gridCell.data.IMPROVE_TYPE == "1"){
* 					exportCell.value = "제안 및 개선사항";
* 				}else{
* 					exportCell.value = "장애";
* 				}
* 				excelCell._column.width = sizeCheck;
* 			}
 * 		});
 */

dxdatagrid.prototype.setMultiExport = function (fileName, obj, customFunc) {
	this.export = {};
	this.export.enabled = false;
	this.export.obj = obj

	this.onExporting = function (e) {

		const workbook = new ExcelJS.Workbook();

		let workInfo = [];

		for (let i = 0; i < obj.length; i++) {
			let worksheet = workbook.addWorksheet(e.component.option("export.obj")[i].name);
			let topLeftCellRow = e.component.option("export.obj")[i].option ? e.component.option("export.obj")[i].header.row + 3 + e.component.option("export.obj")[i].option.length : e.component.option("export.obj")[i].header.row + 2;


			DevExpress.excelExporter.exportDataGrid({
				component: $("#" + e.component.option("export.obj")[i].id).dxDataGrid("instance"),
				worksheet,
				customizeCell(options) {
					const { gridCell } = options;
					const { excelCell } = options;
					if (gridCell.rowType === 'data') {
						// 통계 색변경
						//if (gridCell.value == '101') excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8ECEC' } };

					} else if (gridCell.rowType === 'header') {//헤더(th)부분 색
						excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2ECFD' } };
					}

					// 공통 커스터마이징 함수가 있을때
					if (e.component.option("onCellCustomizeFnc")) {
						cellCustomizeFormat = "xlsx";
						e.component.option().onCellCustomizeFnc(gridCell, excelCell);
					}

					//엑셀쪽 커스터마이징 된 함수가 있을때
					if (customFunc) {
						customFunc(gridCell, excelCell, "xlsx");
					}
				},
				topLeftCell: { row: topLeftCellRow, column: 1 },
			}).then((cellRange) => {
				const excelImage = workbook.addImage({
					base64: base64Logo,
					extension: 'png',
				});


				const headerImage = worksheet.getRow(1);
				headerImage.height = 40;
				worksheet.addImage(excelImage, {
					tl: { col: 0, row: 0 },
					br: { col: 1, row: 1 },
				});

				// header
				const headerRow = worksheet.getRow(2);
				headerRow.height = 30;

				// column의 갯수만큼 제목크기설정
				let header_column = 0;
				for (const cell_length of worksheet._rows) {
					if (!cell_length) continue;
					if (!cell_length._cells) continue;
					if (cell_length._cells.length > header_column) {
						header_column = cell_length._cells.length;
					}
				}

				//엑셀파일의 제목부분
				worksheet.mergeCells(2, 1, obj.header.row, header_column);
				headerRow.getCell(1).value = obj.header.name;
				headerRow.getCell(1).font = { name: 'Segoe UI Light', size: 22 };
				headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
				headerRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2ECFD' } };

				// option 작성
				if (e.component.option("export.option")) {
					let option_length = 0;
					// option 갯수 카운팅
					for (let k = 0; k < e.component.option("export.option").length; k++) {
						if (e.component.option("export.option")[k].length > option_length) option_length = e.component.option("export.option")[k].length;
					}
					for (let k = 0; k < e.component.option("export.option").length; k++) {
						const optionRow = worksheet.getRow(obj.header.row + 2 + k);

						// 컬럼 갯수가 option 최대길이보다 많으면 우측정렬
						for (let j = 0; j < e.component.option("export.option")[k].length; j++) {
							// 좌측정렬
							let cell_index = j + 1;
							// 우측정렬
							if (header_column > option_length) {
								cell_index = header_column - option_length + j + 1;
							}
							// option의 셀 속성
							optionRow.getCell(cell_index).font = { bold: true };
							/*optionRow.getCell(cell_index).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2ECFD' } };*/
							optionRow.getCell(cell_index).value = e.component.option("export.option")[k][j];
							optionRow.getCell(cell_index).alignment = { vertical: 'middle', horizontal: 'center' };
						}
					}
				}
			}).then(() => {
				workbook.xlsx.writeBuffer().then((buffer) => {
					saveAs(new Blob([buffer], { type: 'application/octet-stream' }), obj.name + '.xlsx');
				});
			});
			e.cancel = true;
		}
	}
}

/*
 * CellPrepared, PDF customizeCell, EXCEL customizeCell 공통되는 함수 추가
 * 이때 공통사용 함수는 dxDataGrid.cellCustomizeFnc.js 참조
 *
 * 기존 변경전 부분의 조건들은 gridCell이고
 * 바뀌어야 할 내용은 exportCell이다.
 *
 * 예)
 * dataGrid.setCellCustomizeFnc(function (gridCell, exportCell) {
		if (gridCell.rowType == "data") {
			if (gridCell.column.name == "EMP_DIST") {
				cellTextChange(exportCell,$('#emp_dist_select').val() == "1" ? '배분' : '미배분');
			}

			if (gridCell.column.name == "DIST_DATE" || gridCell.column.name == "EMPLOYEE_NAME") {
				cellTextChange(exportCell,$('#emp_dist_select').val() == "1" ? gridCell.data[gridCell.column.name] : '');
			}
		}
	})
 */
dxdatagrid.prototype.setCellCustomizeFnc = function (fnc) {
	this.onCellCustomizeFnc = fnc;

	if (this.onCellPreparedOrigin) {
		// 2024.06.25 Peter modified. function(e) 를 화살표 함수로 변경함. this.cellVerticalAlign 사용을 가능하게 하기 위해서.....
		this.onCellPrepared = (e) => {
			e.component.option().onCellPreparedOrigin(e);
			cellCustomizeFormat = "onCellPrepared";
			fnc(e, e);
		};
	} else {
		// 2024.06.25
		this.onCellPrepared = (e) => {
			dxDataGridRowSpan(e);
			cellCustomizeFormat = "onCellPrepared";
			fnc(e, e);
		};
	}
}

/**
 *  화면 크기에 따른 AutoPaging을 설정해준다.
 */
dxdatagrid.prototype.setAutoPaging = function (gridId) {
	this.scrolling = {};
	//this.scrolling.rowRenderingMode = 'virtual';
	this.onContentReady = function (e) {
		GridHeightChange(gridId);

		if (e.component.getDataSource() && e.component.getDataSource()._items.length > 0 && e.element.is(":visible")) {
			e.component.option("onContentReady", null);
		}
	}
	$(gridId).addClass("set-auto-paging");
}

/**
 *  서버단 페이징 설정
 *
 *  매개변수인 paramData는 서버로 보내줄 object형식의 데이터이다
 *  그리드를 초기화시켜줄 때에는 dataGrid.refresh();를 통해서 초기화 시켜주면 된다.
 *
 *  서버 paging 적용시 유의점
 *
 * 		 setRemotePaging(url, param, callBack) 으로 선언
 *
 * 		 url은 데이터를 받을때 호출하는 url이고
 * 		 param은 컨트롤러를 호출할 때 넘길 데이터
 * 		 callBack는 데이터를 받은 후 실행시킬 함수다.
 *
 * 		 조회시 refreshGridPaging(dataGrid, param, url, callBack); 선언으로 param 재 바인딩 및 refresh 조회, url은 재 바인딩시 url 이 변경될 경우 넣어서 사용
 *
 * 		 서버로 보내는 데이터는 object 형태로 고정 (formData로 보내면 에러)
 *
 * 		 서버에서 받아오는 데이터인 Object의 List 값의 이름을 list로 통일
 * 		 예) object.loginLogList -> object.list
 *
 * 		 param의 requireTotalCount가 true인지를 비교하여 true면 totalCount 서버에서 받아오기
 * 		 select count(*)
 *
 *  	쿼리문에 LIMIT ${SKIP}, ${TAKE} 추가하여, 받아올 데이터 갯수 지정
 *  	<if test='TAKE != null and !TAKE.equals("")'>
 *  		LIMIT ${SKIP}, ${TAKE}
 *  	</if>
 */
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
dxdatagrid.prototype.setRemotePaging = function (obj) {
	this.remoteOperations = {
		filtering: true,
		sorting: true,
		paging: true,
		summary: obj && obj.remoteSummary === true // remoteSummary 옵션에 따라 결정
	};
	this.url = obj ? obj.url : null;
	let setKey = (obj && obj.key) ? obj.key : this.keyExpr;
	this.callBack = obj ? obj.callBack : null;

	this.dataSource = devCustomDataSource({ url: this.url, param: obj ? obj.param : null, callBack: this.callBack, key: setKey });
}

/**
 * columns 실시간 업데이트.. 생성 후에....
 * https://js.devexpress.com/jQuery/Documentation/ApiReference/UI_Components/dxDataGrid/Methods/#columnOptionid
 */
function updateDxDataGridCaptions(obj, captions) {
	// 기존 저장되어 있는 columns 의 갯수를 알기 위해서.....
	let cols = obj.element.option('columns');
	for (let i = 0; i < cols.length; i++) {
		let col = obj.element.columnOption(i);
		// 예외처리..... 이런 경우는 없겠지만...
		if (!col) {
			break;
		}
		let newCaption = '';
		if ((!captions) || (!captions[i])) {
			// 둘다 될 것 같긴한데....
			// newCaption = this.columnOption(i, 'caption');
			newCaption = col.caption;
		} else {
			newCaption = captions[i]
		}
		obj.element.columnOption(i, 'caption', newCaption);
	}
};

// obj는
// element - 필수
/**
 * 서버단 페이징 리프레시
 *
 * 매개변수 obj 는 필요한 속성들을 객체화 시킨것이다.
 * obj의 element는 데이터그리드의 Element값이다. 이 값은 필수로 들어가야한다.
 * obj의 param은 서버로 보내줄 object형식의 데이터이다.
 * obj의 url은 서버 통신에 필요한 url 주소며 변경시에만 넣어주면 된다.
 * obj의 callBack은 서버에서 데이터를 받아온 후에 실행되는 callBack함수로 변경시에만 넣어주면 된다.
 * obj의 key는 데이터그리드 세팅시 사용될 key값이며 변경시에만 넣어주면 된다.
 * obj의 keepPage은 리프레시 시 현제 페이지를 유지할지의 유무이다. 페이지를 유지하고싶으면 true를 넣어주면 된다.
 */
function refreshGridPaging(obj) {
	let setUrl = obj.element.option("url");
	let setCallBack = obj.element.option("callBack");
	let currentPageIndex = obj.currentPage !== undefined ? obj.currentPage : 0;

	let setKey = null;
	try {
		setKey = obj.element.option("dataSource").key();
		//       logDisplay(1,"222 만들어 진것 없앤 후에.... AAAAAAAAAAAAAAAAAAAAAAAAAAAA: setKey : "+setKey);

	} catch (error) {
	}

	if (obj.url) {
		setUrl = obj.url;
		obj.element.option("url", obj.url);
	}
	if (obj.callBack) {
		setCallBack = obj.callBack;
		obj.element.option("callBack", obj.callBack);
	}
	//logDisplay(1,"AAAAAAAAAAAAAAAAAAAAAAAAAAAA: obj.keyExpr : "+obj.key);
	if (obj.key) {
		setKey = obj.key;
	}

	// 페이지 인덱스 설정 부분 수정
	if (obj.keepPage && obj.currentPage !== undefined) {
		// 페이지 유지 옵션이 있으면 전달받은 페이지 인덱스 사용
		obj.element.option("paging.pageIndex", currentPageIndex);
	} else if (!researchFlag) {
		// 그 외의 경우 기존 로직대로
		obj.element.option("paging.pageIndex", 0);
	}

	researchFlag = false;

	obj.element.clearSelection();
	obj.element.option("dataSource", devCustomDataSource({ url: setUrl, param: obj.param, callBack: setCallBack, key: setKey }));
	obj.element.refresh();
}

// 함수

/**
 * 서버단 페이징 DataSource 설정
 *
 * 매개변수인 paramData는 서버로 보내줄 object형식의 데이터이다
 * obj는
 * 	url: 서버연결을 위한 url
 *  param: 서버로 보낼 dataParam
 * 	callBack: 데이터를 받은 후 실행시켜야 할 callBack함수
 * 	key: 그리드의 key값 세팅
 */
function devCustomDataSource(obj) {
	return new DevExpress.data.CustomStore({
		key: obj.key,
		load: function (loadOptions) {
			//console.log("loadOption: ",loadOptions);
			var d = $.Deferred();
			var params = {};
			// 데이터그리드의 정보를 params에 담는다
			[
				"filter",
				"group",
				"groupSummary",
				"parentIds",
				"requireGroupCount",
				"requireTotalCount",
				"searchExpr",
				"searchOperation",
				"searchValue",
				"select",
				"skip",
				"sort",
				"take",
				"totalSummary",
				"userData"
			].forEach(function (i) {
				if (i in loadOptions && isNotEmpty(loadOptions[i])) {
					if (i === "parentIds") {
						params[i] = loadOptions[i];
					} else {
						params[i] = JSON.stringify(loadOptions[i]);
					}
				}
			});

			if (obj.param) {

				//  callFlowGrid(콜여정)에서는 선택한 행에 대한 내용을 excel이나 pdf로 내보냅니다... 2025.04.16 SJK
				if(window.exportCallFlow){
					if (obj && obj.param && typeof callFlowGrid !== 'undefined' && Array.isArray(callFlowGrid) && callFlowGrid.length > 0 && callFlowGrid[0]) {
						const selectedRow = callFlowGrid[0].getSelectedRowsData();
						if (Array.isArray(selectedRow) && selectedRow.length > 0 && selectedRow[0] && selectedRow[0].callId !== undefined) {
							obj.param.callId = selectedRow[0].callId;
						}
					}
				}
				Object.assign(params, obj.param);
			}

			if (!obj.url) {
				d.resolve([], {
					//중요 : 먼저 totalCount를 서버에서 가저온 후에 [totalCount / paging.pageSize]로 paging index를 보여줌
					totalCount: 0,
				});
				return d.promise();
			}

			//logDisplay(1,"999 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA obj.url : "+obj.url)
			if (obj.url === 'dataClear') {
				d.resolve([], {
					//중요 : 먼저 totalCount를 서버에서 가저온 후에 [totalCount / paging.pageSize]로 paging index를 보여줌
					totalCount: 0,
				});
				return d.promise();
			}

			$.ajax({
				url: obj.url,
				data: JSON.stringify(params),
				type: "post",
				contentType: 'application/json',
				dataType: "json",
				timeout: 5000,
				success(response) {
					let data = response.list != undefined ? response.list : [];
					let totalCount = data.length > 0 ? data[0].totalCount : 0;
					// d.resolve(데이터리스트, {서버원격작업 데이터})
					d.resolve(data, {
						//중요 : 먼저 totalCount를 서버에서 가저온 후에 [totalCount / paging.pageSize]로 paging index를 보여줌
						totalCount: totalCount,
						// summary는 배열[값,값,값] 으로 보내주면 grid summary의 순서에맞게 그려줌
						summary: response.summary,
						groupCount: response.groupCount
					});

					if (params.requireTotalCount == "true" && obj.callBack) {
						obj.callBack(response);
					}

					if (window.exportCallFlow) {
						obj.param.callId = '';
						window.exportCallFlow = false;
					}
				}, error() {
					throw "Data loading error"
				}
			});

			return d.promise();
		},
	})
}

function isNotEmpty(value) {
	return value !== undefined && value !== null && value !== "";
}

/**
 * 엑셀이나 pdf 로 다운로드 기능
 * format: xlsx or pdf
 */
function exportGridToFormat(e, format) {
	if (format == 'excel') format = "xlsx";
	let em = {
		cancel: true,
		component: e,
		element: e._$element,
		fileName: "DataGrid",
		format: format,
		selectedRowsOnly: true
	}

//  callFlowGrid(콜여정)에서는 선택한 행에 대한 내용을 excel이나 pdf로 내보냅니다... 2025.04.16 SJK
	if(typeof callFlowGrid !== 'undefined' && callFlowGrid[0] && e===callFlowGrid[0]){
		window.exportCallFlow = true;

		const selectedRow = callFlowGrid[0].getSelectedRowsData();
		let options = [];
		if(selectedRow && selectedRow.length > 0 ) {
			//선택한 행을 기반으로 추가옵션 설정
			options.push(['콜ID', String(selectedRow[0].callId)]);
			options.push(['전화번호', selectedRow[0].callTel]);
			callFlowGrid[0].option("export.option", options);

			//추가로 export할 영역의 div id값
			em.exportParams = {
				additionalDiv: 'call-history-area',
			};
			
		}
	}


	e.option().onExporting(em);
}


function GridHeightChange(gridId) {

	let gridNumberOfRow = 0;
	let gridOneRowHeight = 0;
	let gridPageMiddleHeight = 0;

	let selector = $(gridId).find('.dx-data-row');
	if (selector.length > 0) {
		gridOneRowHeight = selector.eq(0).outerHeight(true) + 0.5;
	} else {
		$(gridId).dxDataGrid("instance").pageSize(1);
		return;
	}

	selector = $(gridId).find('.dx-datagrid-rowsview').find('div:eq(0)');
	gridPageMiddleHeight = selector.outerHeight(true) - 1;

	if (gridOneRowHeight === 0) gridNumberOfRow = 10;
	else gridNumberOfRow = Math.floor((gridPageMiddleHeight) / gridOneRowHeight);

	if (gridNumberOfRow <= 0) gridNumberOfRow = 1;

	$(gridId).dxDataGrid("instance").pageSize(gridNumberOfRow);
}
