/*******************************************************
 저작권 : COPYRIGHTⓒ 2023 leenicoms.
 작성일자: 2023.02.13
 작성자: njw
 파일내용: devextreme circularGauge wrapper library
 주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
 주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
 주3) event callback은 overloading하여 사용
 변경이력:
 -. 2023.02.13 최초 작성
 ********************************************************/
function dxCircularGauge() {
	this.dataSource = [];
}

/**
 * 게이지의 기본 값을 지정합니다.
 * data type은 int이다. server에서 받아온 data를 넣어준다. ex) value = 80;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/#value
 */
dxCircularGauge.prototype.setValue = function(value) {
	this.value = value;
};

/**
 * circularGauge의 UI 구성 요소의 제목을 구성합니다.
 * data type은 String이다. ex) title = '현재발전출력 (KW)';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/title/
 */
dxCircularGauge.prototype.setTitle = function(title) {
	this.title = {};
	this.title.text = title;
	this.title.font = {
		color: "#555",
		size: 42,
		opacity:1,		// value from 0 to 1
		weight: 700,
	};
};

/**
 * circularGauge의 계기 범위 컨테이너 속성을 지정합니다.
 * data type은 String, String, int이다. ex) backgroundColor = '#fcd874'; orientation = 'inside'; width = 100;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/title/
 */
dxCircularGauge.prototype.setRangeContainer = function(backgroundColor, orientation, width) {
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/rangeContainer/#orientation
	//Accepted Values: 'center' | 'inside' | 'outside'
	this.rangeContainer = {};
	this.rangeContainer.backgroundColor = backgroundColor;
	this.rangeContainer.orientation = orientation;
	this.rangeContainer.width = width;
	//	this.rangeContainer.offeet = 20;
};

/**
 * circularGauge의 계기 범위 컨테이너 속성을 지정합니다.
 * data type은 String, String, int이다. ex) backgroundColor = '#fcd874'; orientation = 'inside'; width = 100;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/title/
 */
dxCircularGauge.prototype.setRangeContainer = function(backgroundColor, orientation, width) {
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/rangeContainer/#orientation
	//Accepted Values: 'center' | 'inside' | 'outside'
	this.rangeContainer = {};
	this.rangeContainer.backgroundColor = backgroundColor;
	this.rangeContainer.orientation = orientation;
	this.rangeContainer.width = width;
};

/**
 * 공통 옵션을 설정합니다.
 */
function options() {
	this.geometry = {};
	this.scale = {};
	this.tick = {};
	this.valueIndicator = {};
	this.size = {};
};


/**
 * UI 구성 요소의 기하 도형을 설정하는 데 필요한 속성을 지정합니다.
 * data type은 int, int이다. ex) startAngle = 180; endAngle = 0;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/geometry/
 */
options.prototype.setGeometry = function(startAngle, endAngle) {
	this.geometry.startAngle = startAngle;
	this.geometry.endAngle = endAngle;
}

/**
 * 계기의 배율 속성을 지정합니다.
 * data type은 int, int, int, String이다. ex) startValue = 0; endValue = 200; tickInterval = 100; orientation = 'inside';
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/scale/
 */
options.prototype.setScale = function(startValue, endValue, tickInterval, orientation) {
	this.scale.startValue = startValue;
	this.scale.endValue = endValue;
	this.scale.tickInterval = tickInterval;
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/scale/#orientation
	//Accepted Values: 'center' | 'inside' | 'outside'
	this.scale.orientation = orientation;
}

/**
 * 계기의 마이너 틱 속성을 지정합니다.
 * data type은 String, int, int, boolean, int이다. ex) color = "#FFFFFF"; length = 1; opacity = 1; visible = false; width = 10;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/scale/minorTick/
 */
options.prototype.setMinorTick = function(color, length, opacity, visible, width) {
	this.scale.minorTick = {
		color: "#FFFFFF",
		length: 1,
		opacity: 1,
		visible: false,
		width: 10
	}
}

/**
 * 주 축 눈금의 모양을 구성합니다.
 * data type은 String, int, int, boolean, int이다. ex) color = "#000000"; length = 30; opacity = 1; visible = true; width = 2;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/scale/tick/
 */
options.prototype.setTick = function(color, length, opacity, visible, width) {
	this.scale.tick = {
		color: "#000000",
		length: 30,
		opacity: 1,
		visible: visible,
		width: 2
	}
}

options.prototype.setLabel = function(visible) {
	this.scale.label = {
		visible: visible,
	}
}

options.prototype.setMargin = function(margin) {
	this.margin = {
		bottom: margin,
		left: margin,
		right: margin,
		top: margin
	}
}


/**
 * 값 표시기의 모양 특성을 지정합니다.
 * data type은 String, int, int이다. ex) color = "black"; type = "triangleNeedle"; width = 20;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/valueIndicator/
 */
options.prototype.setValueIndicator = function(color, type, width, offset, size) {
	//https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/valueIndicator/#type
	//Accepted Values: 'rectangleNeedle' | 'triangleNeedle' | 'twoColorNeedle' | 'rangeBar' | 'triangleMarker' | 'textCloud'

	this.valueIndicator.color = color;
	this.valueIndicator.type = type;
	this.valueIndicator.width = width;		//표시기의 굵기
	this.valueIndicator.offset = offset;	//표시기와 보이지 않는 눈금선 사이의 거리 sjk추가
	this.valueIndicator.size = size;	//rangeBar 유형 의 지표에 대한 범위 표시줄 굵기 sjk추가

//	this.valueIndicator = {
//		color: "black",
//	    type: "triangleNeedle",
//	    width:20
// 		offset:0
// 		size:10
//	}

	/** sjk 추가
	 * UI 구성 요소의 크기를 픽셀 단위로 지정합니다.
	 * data type은 int, int이다. Default Value) height = 300; width = 300;
	 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxCircularGauge/Configuration/size/
	 */

	options.prototype.setSize = function (width){
		// this.size.height = height;
		this.size.width = width;
	}
	
	options.prototype.setHeight = function (height){
		this.size.height = height;
	}
}
