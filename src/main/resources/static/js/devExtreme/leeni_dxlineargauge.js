/*******************************************************
 저작권 : COPYRIGHTⓒ 2023 leenicoms.
 작성일자: 2023.03.30
 작성자: sjk
 파일내용: devextreme LinearGauge wrapper library
 주1) wrapper library의 파일명은 leeni_xxx.js 형식으로 만들어야 함
 주2) 사용하는 속성은 function으로 제공하여 app에서는 직접적으로 option 값은 수정 불가능하게 만듬
 주3) event callback은 overloading하여 사용
 변경이력:
 -. 2023.03.30 최초 작성
 ********************************************************/
function dxLinearGauge() {
	this.dataSource = [];
}

/**
 * 게이지의 기본 값을 지정합니다.
 * data type은 int이다. server에서 받아온 data를 넣어준다. ex) value = 80;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxLinearGauge/Configuration/#value
 */
dxLinearGauge.prototype.setValue = function(value) {
	this.value = value;
};



/**
 * LinearGauge 계기 범위 컨테이너 속성을 지정합니다.
 * data type은 String, int이다. ex) backgroundColor = '#fcd874'; width = 100;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxLinearGauge/Configuration/rangeContainer/
 */
dxLinearGauge.prototype.setRangeContainer = function(backgroundColor, width) {
	this.rangeContainer = {};
	this.rangeContainer.backgroundColor = backgroundColor;
	this.rangeContainer.width = width;
};

/**
 * 계기의 눈금 속성을 지정합니다.
 * data type은 int, int, int이다. ex) startValue = 0; endValue = 200; tickInterval = 100;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxLinearGauge/Configuration/scale/
 */
dxLinearGauge.prototype.setScale = function(startValue, endValue, tickInterval) {
	this.scale = {};
	this.scale.startValue = startValue;
	this.scale.endValue = endValue;
	this.scale.tickInterval = tickInterval;
}


/**
 * 값 표시기의 모양 특성을 지정합니다.
 * data type은 String, int, int이다. ex) color = "black"; type = "triangleNeedle"; width = 20;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxLinearGauge/Configuration/valueIndicator/
 */
dxLinearGauge.prototype.setValueIndicator = function(color, width, offset) {
	this.valueIndicator = {};
	this.valueIndicator.color = color;
	this.valueIndicator.width = width;		//표시기의 굵기
	this.valueIndicator.offset = offset;	//표시기와 보이지 않는 눈금선 사이의 거리

}
/**
 * UI 구성 요소의 크기를 픽셀 단위로 지정합니다.
 * data type은  int이다. Default Value) width = 300;
 * https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxLinearGauge/Configuration/size/
 */
dxLinearGauge.prototype.setSize = function (width){
	this.width = width;
}

