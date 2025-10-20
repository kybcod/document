//dx-quill.min.js 을 사용해야함

let containor = null;
let component = null;

function dxhtmleditor() {
	this.mediaResizing = {
      enabled: false,
    }
    this.toolbar = {
		items: [],
	}
}

dxhtmleditor.prototype.setValue = function(val){
	this.value = val;
}


// 화면 표출용 Viewer 세팅 value값만 넣어서 사용하면됨
dxhtmleditor.prototype.setViewer = function(){
	this.focusStateEnabled = false;
	this.toolbar = false;
	this.readOnly = true;
}

// toolbar 자주쓸만한것들을 모아놓았다.
dxhtmleditor.prototype.setNomalToolbar = function(){
	this.toolbar.items = ['undo', 'redo', 'separator'
			,{
				name: 'font',
				acceptedValues: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', '맑은 고딕', '궁서', '굴림체', '굴림', '돋움체', '바탕체','NotoSansKR'],
			}
			,{
				name: 'size',
				acceptedValues: ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '30px', '36px', '50px', '72px'],
			},'color','background', 'separator','bold', 'italic', 'strike', 'underline', 'separator','alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'separator'
	];
}


// toolbar 커스텀 세팅
// item목록
// https://js.devexpress.com/Documentation/Guide/UI_Components/HtmlEditor/Toolbar/Predefined_items/
dxhtmleditor.prototype.setCustomToolbar = function(itemList){
	this.toolbar.items = itemList;
}

// 옵션변경시 이벤트
dxhtmleditor.prototype.setOnOptionChanged = function(event){
	this.onOptionChanged = event;
}

// 옵션변경시 이벤트
dxhtmleditor.prototype.setOnFocusIn = function(event){
	this.onFocusIn = event;
}

// toolbar item 추가
dxhtmleditor.prototype.setAddItems = function(itemList){
	for(const item of itemList){
		this.toolbar.items.push(item);
	}
}

// toolbar 중간선 추가
dxhtmleditor.prototype.setAddLine = function(){
	this.toolbar.items.push('separator');
}

/**
 *  value를 받아야하는 item을 세팅
 *  size(fontsize), font, header 등이 있다.
 *  itemName은 해당 아이템 이름 valList는 세팅할 value값을 리스트로 받아온다.
 */
dxhtmleditor.prototype.setItemValue = function(itemName,valList){
	// 해당 데이터의 유무
	let check = false;
	for(const item of this.toolbar.items){
		if(!item.name) continue;
		if(item.name == itemName){
			check = true;
			item.acceptedValues = valList;
		}
	}
	if(!check){
		this.toolbar.items.push(
			{
				name: itemName,
				acceptedValues: valList,
			}
		)
	}
}

/**
 * color-picker 세팅
 * colorList는 원하는 색상의 코드를 List 로 받아주면됨
 */

dxhtmleditor.prototype.setColorPicker = function(colorList){
	let colors = colorList;
	// onclick color 변경 이벤트를 위한 Element
	let dropDownElement = null;
	let colorPicker = null;
	
	this.onContentReady = function(e){
		containor = e.element
		component = e.component;

		containor.find('.dx-htmleditor-content').off('click').on('click', function() {
			let color = component.getFormat().color ? component.getFormat().color : '#000000';
			applyColor(dropDownElement, color);
		})
		containor.find('.dx-htmleditor-content').off('keyup').on('keyup', function() {
			let color = component.getFormat().color ? component.getFormat().color : '#000000';
			applyColor(dropDownElement, color);
		})
	}
	
	let obj = {
          widget: 'dxDropDownButton',
          name: "color_picker",
          options: {
            items: colors,
            icon: 'square',
            stylingMode: 'text',
            deferRendering: false,
            dropDownOptions: { width: '90px' },
            onContentReady(e) {
				dropDownButton = e.component;
				dropDownElement = dropDownButton.$element().find('.dx-dropdownbutton-action .dx-icon').first();
            },
            dropDownContentTemplate(data, $container) {
              colorPicker = $('<div>')
                .addClass('custom-color-picker')
                .appendTo($container);

              data.forEach((color) => {
					let button = createColorBtn(color);
					
					applyColor(button, color);
					colorPicker.append(button);
              });
              colorPicker.append('<br>');
            },
          },
        }
	
	// color picker color 뒤쪽 color없으면 맨뒤에 push 하게 만들기
	
	let colorIndex = -99;
	for(let i = 0; i < this.toolbar.items.length; i++){
		if(this.toolbar.items[i].name){
			if(this.toolbar.items[i].name == "color") colorIndex = i;
		}else{
			if(this.toolbar.items[i] == "color") colorIndex = i;
		}
	}
	
	if(colorIndex < 0){
		this.toolbar.items.push(obj);
	}else{
		this.toolbar.items.splice(colorIndex + 1, 0, obj);
	}
	
	function applyColor($element, color) {
		if (color) {
			$element.removeClass('dx-theme-text-color');
			$element.css('color', color);
		} else {
			$element.addClass('dx-theme-text-color');
		}
	}
	
	function createColorBtn(color) {
		const button = $('<i>')
			.addClass('color dx-icon dx-icon-square')
			.on('dxclick', () => {
				component.format('color', color);
				const selection = component.getSelection(true); // true to avoid focusing out
				component.formatText(selection.index, selection.length, "color", color);
				applyColor(dropDownButton.$element().find('.dx-dropdownbutton-action .dx-icon').first(), color);
				dropDownButton.close();
			});
		return button;
	}
	
}
	

       

// color-picker 세팅 끝