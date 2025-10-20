
// 공통으로 사용할 PKG_ID 리스트를 저장하는 전역 변수
var userServPkgIdList = [];

/**
 * USER_SERV의 PKG_ID 목록을 가져와 userServPkgIdList 변수에 저장합니다.
 */
function getCommonUserServPkgIdList() {
    $.ajax({
        url: "dbms/user-serv/pkgId/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            userServPkgIdList = res.map(item => item.upkgId);
        },
    });
}


/**
 * 표준화된 USER_SERV 관리 팝업을 엽니다.
 * @param {object} options - 팝업 설정을 위한 객체입니다.
 * @param {string} options.popupContainerId - 팝업으로 만들 div의 ID입니다.
 * @param {string} options.gridId - 팝업 내부의 그리드에 할당할 ID입니다.
 * @param {string} options.selectBoxId - 팝업 내부의 셀렉트 박스에 할당할 ID입니다.
 * @param {string[]} options.pkgIdList - PKG_ID 문자열 배열입니다. (이제 userServPkgIdList 전역 변수를 사용하므로 더 이상 필요하지 않을 수 있습니다.)
 * @param {string} options.initialPkgId - 초기에 선택하고 로드할 PKG_ID입니다.
 * @param {object} options.gridInstanceHolder - 그리드 인스턴스를 담을 객체입니다. (예: { instance: null }).
 */
function openCommonUserServPopup(options) {
    const {
        popupContainerId,
        gridId,
        selectBoxId,
        initialPkgId,
        gridInstanceHolder
    } = options;

    const dataLoadFunc = (pkgId) => {
        if (!gridInstanceHolder.instance) return;
        gridInstanceHolder.instance.beginCustomLoading();
        $.ajax({
            url: "dbms/user-serv/pkgIdList",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ upkgId: pkgId }),
            success(res) {
                gridInstanceHolder.instance.option("dataSource", res);
            },
            complete() {
                gridInstanceHolder.instance.endCustomLoading();
            }
        });
    };

    const gridSettingsFunc = () => {
        let dataGrid = new dxdatagrid();
        let columns = ['upkgId', 'grpId', 'enable', 'kind', 'noproc', 'path', 'optPrm'];
        let captions = ['PKG_ID', 'GRP_ID', 'ENABLE', 'KIND', 'NOPROC', 'PATH', 'OPT_PRM'];
        dataGrid.setColumns(columns);
        dataGrid.setCaptions(captions);
        dataGrid.setPaging(10);
        dataGrid.setEditing("row", true, true, true);
        dataGrid.setEditingTexts("USER_SERV", "이 항목을 삭제하시겠습니까?");
        dataGrid.setValidationRules('upkgId', 'required', 'PKG_ID를 입력해주세요');
        dataGrid.setValidationRules('grpId', 'required', 'GRP_ID를 입력해주세요');
        dataGrid.setColumnReadOnly("upkgId", "grpId");

        const refreshGrid = (upkgId) => dataLoadFunc(upkgId);

        dataGrid.setOnRowInserting(function(data, deferred) {
            sendDbmsDataToServer("dbms/user-serv/insert", data, deferred, gridInstanceHolder.instance, () => refreshGrid(data.upkgId));
        });
        dataGrid.setOnRowUpdating(function(data, deferred) {
            sendDbmsDataToServer("dbms/user-serv/update", data, deferred, gridInstanceHolder.instance, () => refreshGrid(data.upkgId));
        });
        dataGrid.setOnRowRemoving(function(data, deferred) {
            sendDbmsDataToServer("dbms/user-serv/delete", data, deferred, gridInstanceHolder.instance, () => refreshGrid(data.upkgId));
        });

        gridInstanceHolder.instance = $(`#${gridId}`).dxDataGrid(dataGrid).dxDataGrid("instance");
    };

    $(`#${popupContainerId}`).dxPopup({
        visible: true,
        showTitle: true,
        title: "USER_SERV",
        width: 1000,
        height: 700,
        onHidden: function(e) {
            $(e.element).empty();
        },
        contentTemplate: function(container) {
            const selectBoxContainer = $("<div>").css({ marginBottom: "10px" }).appendTo(container);
            const selectBoxData = [{ text: "전체", value: "" }, ...userServPkgIdList.map(id => ({ text: id, value: id }))];

            $("<div>")
                .attr("id", selectBoxId)
                .appendTo(selectBoxContainer)
                .dxSelectBox({
                    dataSource: selectBoxData,
                    displayExpr: "text",
                    valueExpr: "value",
                    value: initialPkgId,
                    placeholder: "PKG ID를 선택하세요",
                    width: 300,
                    onValueChanged: function(e) {
                        dataLoadFunc(e.value || "");
                    }
                });

            $("<div>").attr("id", gridId).appendTo(container);
            gridSettingsFunc();
            dataLoadFunc(initialPkgId);
        },
    });
}
