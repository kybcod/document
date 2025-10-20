/*******************************************************
저작권 : COPYRIGHTⓒ 2023 leenicoms.
작성일자: 2023.02.13
작성자: njw
파일내용: devextreme chart wrapper library
	   주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
	   주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
	   주3) event callback은 overloading하여 사용
변경이력:
	-. 2023.02.13 최초 작성
********************************************************/
function dxchart() {
    this.dataSource = [];
}

/**
 * chart의 data source를 지정 = server에서 받아온 data를 넣어준다.
 */
dxchart.prototype.setDataSource = function(dataSource) {
	this.dataSource = dataSource;
};

/**
 * chart의 계열 및 해당 요소를 색칠하는 데 사용할 팔레트를 설정합니다.
 * data type은 array이다. ex) palette = '['#082238']';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/#palette
 */
dxchart.prototype.setPalette = function(palette) {
	this.palette = palette;
};

/**
 * chart의 UI 구성 요소의 제목을 구성합니다.
 * data type은 String이다. ex) title = '발전량(kw)';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/title/
 */
dxchart.prototype.setTitle = function(title) {
	this.title = {};
	this.title.text = title;
	this.title.font = {
		family: "NotoSansKR",
		color: "#555",
		size: 16,
		opacity:1,		// value from 0 to 1
		weight: 900			//Accepts values from 100 to 900 in increments of 100
	};
};

/**
 * chart의 모든 계열에 공통된 설정을 지정합니다.
 * data type은 float, String, String이다. ex) barPadding = 0.5; argumentField = '데이터컬럼명'; type = 'bar';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/commonSeriesSettings/
 */
dxchart.prototype.setCommonSeriesSettings = function(barPadding, argumentField, type) {
	this.commonSeriesSettings = {};
	this.commonSeriesSettings.barPadding = barPadding;
	this.commonSeriesSettings.argumentField = argumentField;
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/commonSeriesSettings/#type
		/*
		Accepted Values: 'area' | 'bar' | 'bubble' | 'candlestick' | 'fullstackedarea' | 'fullstackedbar' | 'fullstackedline' |
		'fullstackedspline' | 'fullstackedsplinearea' | 'line' | 'rangearea' | 'rangebar' | 'scatter' | 'spline' | 'splinearea' |
		'stackedarea' | 'stackedbar' | 'stackedline' | 'stackedspline' | 'stackedsplinearea' | 'steparea' | 'stepline' | 'stock'
		*/
    this.commonSeriesSettings.type = type;
    
    //2023.08.14 chart line graph에서 mouse hover시에 나타나는 원둘레 지정
	 this.commonSeriesSettings.point = {};
	 this.commonSeriesSettings.point.hoverStyle = {};
	 this.commonSeriesSettings.point.hoverStyle.border = {};
	 this.commonSeriesSettings.point.hoverStyle.border.width = 1;		//default width=4
};

/**
 * chart의 모든 계열에 공통된 설정을 지정합니다.
 * data type은 String, String, int이다. ex) verticalAlignment = 'bottom'; horizontalAlignment = 'center'; margin = 0;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/legend/
 */
dxchart.prototype.setLegend = function(verticalAlignment, horizontalAlignment, margin, visible) {
	this.legend = {};
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/legend/#verticalAlignment
		//Accepted Values: 'bottom' | 'top'
	this.legend.verticalAlignment = verticalAlignment;
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/legend/#horizontalAlignment
		//Accepted Values: 'center' | 'left' | 'right'
	this.legend.horizontalAlignment = horizontalAlignment;
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/legend/margin/
	this.legend.margin = margin;
	this.legend.visible = visible; // kuni 추가
	
};

// kuni tooltip 추가 생성
dxchart.prototype.setTooltip = function(enabled) {
	this.tooltip = {};
	this.tooltip.zIndex = 99999;
	this.tooltip.enabled = enabled;
};

// kuni argumentAxis 추가 생성
dxchart.prototype.setArgumentAxis = function(valueMarginsEnabled) {
	this.argumentAxis = {};
	this.argumentAxis.valueMarginsEnabled = valueMarginsEnabled;
};

/**
 * chart의 UI 구성 요소 계열의 속성을 지정합니다.
 * data type은 String, String이다. ex) valueField = '데이터컬럼명'; name = '발전량';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/series/
 */
//dxchart.prototype.setSeries = function(valueField, name) {
//	this.series = [];
//	
//	let obj = {};
//	obj.valueField = valueField;
//	obj.name = name;
////	obj.color = color; //kuni 추가
//	this.series.push(obj);
//};

dxchart.prototype.setSeries = function(valueField, name, color, axis) {
	this.series = [];
	
	for (let i=0; i < valueField.length; i++) {
		let obj = {};
		obj.valueField = valueField[i];
		obj.name = name[i];
		obj.color = color[i]; //kuni 추가
		if(axis){
			if(axis[i]){
				obj.axis = axis[i];
			}
		}
		this.series.push(obj);
	}

};
// 추가로 필요한것
/*
chart의 확대 시의 스크롤바의 유무를 지정
visible = 'true' or 'false'
width = 스크롤바 굵기(int)
color = 스크롤바 색상(string)
opacity = 스크롤바 투명도(float)
*/
dxchart.prototype.setScrollBar = function(visible, width, color, opacity){
	this.scrollBar = {};
	this.scrollBar.visible = visible;
	this.scrollBar.position = 'bottom';
    if (width) {
        this.scrollBar.width = width;
    }
    if (color) {
        this.scrollBar.color = color;
    }
    if (opacity) {
        this.scrollBar.opacity = opacity;
    }
}

/*
chart의 줌의 속성을 지정
argumentAxis = 가로대상의 중, valueAxis = 세로대상의 줌을 지원한다
값은 'zoom' 줌 'pan' 드래그 'none' 없음 'both' 둘다
	https://js.devexpress.com/Documentation/Guide/UI_Components/Chart/Zooming_and_Panning/
*/
dxchart.prototype.setZoomAndPan = function(argumentAxis,valueAxis){
	this.zoomAndPan = {};
	this.zoomAndPan.argumentAxis = argumentAxis;
	this.zoomAndPan.valueAxis = valueAxis;
}

/**
 * chart의 animation 속성을 지정합니다.
 * enabled: boolean, duration: number (ms)
 */
dxchart.prototype.setAnimation = function(enabled, duration) {
    this.animation = {
        enabled: enabled,
        duration: duration
    };
};

dxchart.prototype.setSize = function(width,height){
	this.size={};
	if(width){
		this.size.width = width;
	}
	if(height){
		this.size.height = height;
	}
}

/**
 *  차트 이름을 변경해줄수 있는 가능이다 aa는 함수로 들어간다
 *  함수의 매개변수는 data와 g가 있는데 data는 원래의 데이터값을 저장하고있고 g는 해당 데이터를 뿌리는 속성을 담는다
 * https://js.devexpress.com/Demos/WidgetsGallery/Demo/Charts/AxisLabelsTemplates/jQuery/Light/
 */
dxchart.prototype.setLabelTemplate = function(aa){
	this.argumentAxis = {};
	this.argumentAxis.label = {};
	this.argumentAxis.label.template = aa
}

/*
	툴팁의 내용을 수정함 fun 은 함수로 들어가며 해당함수의 매개변수체는 해당 데이터를 관리한다.
	left 와 top은 각각 툴팁의 좌우 패딩 상하 패딩의 수치를 넣는다 int타입
*/
dxchart.prototype.setCustomizeTooltip = function(fun,left,top) {
	this.tooltip.customizeTooltip = fun;
	this.tooltip.paddingLeftRight = left;
	this.tooltip.paddingTopBottom = top;
};

/*
	툴팁의 내용을 value값 이름 + 천단위 콤마 + 소수점으로 수정
	point => 소수점
	series => 해당 seriesName 여부 boolean (multiChart)
	argument => 해당 x축 이름 여부 boolean
*/
dxchart.prototype.setTooltipComma = function(series,argument,point){
	this.tooltip.customizeTooltip = function(e) {
		let html = '';
		if(series){
			html += '<div>' + e.seriesName + '</div><br />';
		}if(argument){
			html += '<div>' + e.argument + '</div><br />';
		}if(point != undefined && point != false && point != null){
			html += '<div>' + parseFloat(parseFloat(e.value).toFixed(point)).toLocaleString() + '</div>';
		}else{
			html += '<div>' + parseFloat(e.value).toLocaleString() + '</div>';
		}
		return {
			html: html
		}
	}
}

dxchart.prototype.setOnSeriesClick = function(){
	this.onSeriesClick = function(e) {
	      const series = e.target;
	      if (series.isVisible()) {
	        series.hide();
	      } else {
	        series.show();
	      }
	    }
}

dxchart.prototype.setOnLegendClick = function(){
	this.onLegendClick = function(e) {
	      const series = e.target;
	      if (series.isVisible()) {
	        series.hide();
	      } else {
	        series.show();
	      }
	    }
}


dxchart.prototype.setOnSeriesClickReset = function(){
	this.onSeriesClick = false;
}

dxchart.prototype.setOnLegendClickReset = function(){
	this.onSeriesClick = false;
}

dxchart.prototype.setArgumentTickInterval = function(tick){
	let argumentAxis = {
        tickInterval: tick,
    }
    if(this.argumentAxis){
		Object.assign(this.argumentAxis, argumentAxis);
	}else{
		this.argumentAxis = argumentAxis
	}
}

dxchart.prototype.setValueTickInterval = function(tick){
	let valueAxis = {
        tickInterval: tick,
    }
	if(this.valueAxis){
		Object.assign(this.valueAxis, valueAxis);
	}else{
		this.valueAxis = valueAxis;
	}
}
// x축 글자 수정 fort는 value앞에 붙여줄 값, back은 value 뒤에 붙여줄 값 slice1,slice2는 value를 자를수있게 slice를 사용하기위한 값
dxchart.prototype.setArgumentAxisLabel = function(front,back,slice1,slice2){
	if(!this.argumentAxis){
		this.argumentAxis = {};
	}
	this.argumentAxis.label = {
		customizeText() {
			return front + `${this.valueText}`.slice(slice1,slice2) + back;
		}
	}
}

// x축 글자 수정, func는 함수
dxchart.prototype.setArgumentAxisLabelFunction = function(func){
	if(!this.argumentAxis){
		this.argumentAxis = {};
	}
	this.argumentAxis.label = {};
	this.argumentAxis.label.customizeText = func;
}

// wordWrap => 자동줄바꿈 ※normal breakWord none
//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/argumentAxis/label/#wordWrap
//overlappingBehavior => 글자가 일정이상 넘어갈때 처리방법 ※rotate stagger none hide
//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/argumentAxis/label/#overlappingBehavior
dxchart.prototype.setArgumentAxisLabelDetail = function(wordWrap,overlappingBehavior){
	if(!this.argumentAxis){
		this.argumentAxis = {};
	}
	if(!this.argumentAxis.label){
		this.argumentAxis.label = {};
	}
	
	if(wordWrap){
		this.argumentAxis.label.wordWrap = wordWrap;
	}
	if(overlappingBehavior){
		this.argumentAxis.label.overlappingBehavior = overlappingBehavior;
	}
}

dxchart.prototype.setArgumentVisualRange = function(length) {
    if (!this.argumentAxis) {
        this.argumentAxis = {};
    }
    this.argumentAxis.visualRange = {
        length: length
    };
};

dxchart.prototype.setWholeRange = function(end,start){
	if(!this.valueAxis){
		this.valueAxis = {};
	}
	this.valueAxis.wholeRange = {
		endValue: end,
		startValue: start,
	}
}

dxchart.prototype.setEndOnTick = function(min,max,onTick){
	let valueAxis = {
		minValueMargin: min,
		maxValueMargin: max,
		endOnTick: onTick,
	}
	if(this.valueAxis){
		Object.assign(this.valueAxis, valueAxis);
	}else{
		this.valueAxis = valueAxis;
	}
}

dxchart.prototype.setMultiSeries = function(valueField, name, color, type, axis, orderType){
	
	for (let i=0; i < valueField.length; i++) {
		let obj = {};
		obj.valueField = valueField[i];
		obj.name = name[i];
		obj.color = color[i]; //kuni 추가
		obj.type = type;
		if(axis){
			if(axis[i]){
				obj.axis = axis[i];
			}			
		}
		if(orderType == 'unshift'){
			this.series.unshift(obj);
		}else{		
			this.series.push(obj);
		}
	}
}
// 추가적인 value 의 Axis값을 설정 grid는 추가되는그리드를 제외한 기존 그리드를 그려줄지의 여부
dxchart.prototype.setValueAxis = function(grid, name, position, tickInterval, customizeText) {
	this.valueAxis = [];
	if(grid){
		this.valueAxis.push({grid: {visible: true}});
	}
	for (let i = 0; i < name.length; i++) {
		let obj = {};
		obj.name = name[i];
		if(position[i] == 'visible'){
			obj.visible = false;
		}else{
			obj.position = position[i];
		}
		if (tickInterval) {
			if (tickInterval[i]) {
				obj.tickInterval = tickInterval[i];
			}
		}
		if (customizeText) {
			if (customizeText[i]) {
				obj.customizeText = customizeText[i];
			}
		}
		this.valueAxis.push(obj);
	}
}
// 차트 위에 라벨요소를 추가
// https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxChart/Configuration/commonSeriesSettings/label/
dxchart.prototype.setLabel = function (point, backgroundColor, color){
	if (!this.commonSeriesSettings){
		this.commonSeriesSettings = {};
	}
	
	this.commonSeriesSettings.label = {
		visible : true,
		font : {},
		showForZeroValues : false,
		position : "outside",
		customizeText: function(arg){
			return floatComma(arg.value);
		}
	}
	
	if (point != null && point != undefined){
		this.commonSeriesSettings.label.customizeText = function(arg){
			return floatComma(arg.value, point);
		}
	}
	
	if (backgroundColor){
		this.commonSeriesSettings.label.backgroundColor = backgroundColor;
	}
	if (color){
		this.commonSeriesSettings.label.font.color = color;
	}
}



