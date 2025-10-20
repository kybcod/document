/**
 * onCellPrepared를 사용함으로 인해 조회된 데이터와 보이지는 데이터가 다를 때
 * 해당 변경사항을 excel이나 pdf로 다운 받아올 때에도 적용되게 해줌
 * 
 * 원하는 css효과가 cellCsschange()에 없다면 case문으로 추가해서 사용해야함
 * 
 * 문자를 바꿔주고싶다면 cellTextChange()
 */

let cellCustomizeFormat;

function cellCssChange(changeCell, val, cssOption) {
	if (cellCustomizeFormat === "onCellPrepared") {
		changeCell.cellElement.css(cssOption, val);
	} else if (cellCustomizeFormat === "xlsx") {
		switch (cssOption) {
			case "font-size":
				if (!changeCell.font) {
					changeCell.font = {};
				}
				changeCell.font.size = val;
				break;
			case "background-color":
				changeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: val.replaceAll("#", "") } };
				break;
			case "color":
				if (!changeCell.font) {
					changeCell.font = {};
				}
				changeCell.font.color = { argb: val.replaceAll("#", ""), theme: 1 };
				break;
			// 2024.06.25 Peter Add. cellCssChange 사용하는 곳이 없지만, 아래 소스 추가해 놓음.
			case "vertical-align":
				changeCell.verticalAlign = val;
				break;
		}
	} else if (cellCustomizeFormat === "pdf") {
		switch (cssOption) {
			case "font-size":
				if (!changeCell.font) {
					changeCell.font = {};
				}
				changeCell.font.size = val;
				break;
			case "background-color":
				changeCell.backgroundColor = val.replaceAll("#", "");
				break;
			case "color":
				changeCell.textColor = val.replaceAll("#", "");
				break;
			// 2024.06.25 Peter Add. cellCssChange 사용하는 곳이 없지만, 아래 소스 추가해 놓음.
			case "vertical-align":
				changeCell.verticalAlign = val;
				break;
		}
	}
}

function cellTextChange(changeCell, val) {
	if (cellCustomizeFormat === "onCellPrepared") {
		changeCell.cellElement.text(val);
	} else if (cellCustomizeFormat === "xlsx") {
		changeCell.value = val;
	} else if (cellCustomizeFormat === "pdf") {
		changeCell.text = val;
	}
}