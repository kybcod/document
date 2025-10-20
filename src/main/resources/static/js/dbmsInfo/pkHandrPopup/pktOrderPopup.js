// PK_HNDR_PKT_ORDER 팝업 열기
function openPkgOrderPopup() {
    $("#edgePktOrderPopup").dxPopup({
        visible: true,
        showTitle: true,
        title: "PK_HNDR_PKT_ORDER",
        width: 1000,
        height: 700,
        contentTemplate: function(container) {
            container.empty();

            const selectBoxContainer = $("<div>").css({ marginBottom: "10px" }).appendTo(container);
            const selectBoxData = [{ text: "전체", value: "" }, ...pktServiceIds.map(id => ({ text: id, value: id }))];
            const initialValue = selectedServiceId ? selectedServiceId : "";

            $("<div>")
                .attr("id", "pktOrderSelectBox")
                .appendTo(selectBoxContainer)
                .dxSelectBox({
                    dataSource: selectBoxData,
                    displayExpr: "text",
                    valueExpr: "value",
                    value : initialValue,
                    placeholder: "Service Id를 선택하세요",
                    width: 300,
                    onValueChanged: function(e) {
                        const selectServId = (e.value === undefined || e.value === null || e.value === "") ? "" : e.value;
                        pktOrderList(selectServId);
                    }
                });

            // 팝업 열릴 때 전체 기준으로 1회 호출
            pktOrderList(initialValue);

            // 그리드 삽입
            $("<div>")
                .attr("id", "pktOrderGrid")
                .appendTo(container);

            pktOrderGridSetting();
        },
    });
}


// PK_HNDR_PKT_ORDER 팝업 안 그리드
function pktOrderGridSetting(){
    let dataGrid = new dxdatagrid();
    let columns = ['pktOrderServId', 'ppid', 'pkid', 'cond'];
    let captions = ['Service Id', 'Ppid','Pkid', 'Condition'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(10);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingPopup("PK_HNDR_PKT_ORDER", 400, 400);
    dataGrid.setEditingForm(
        ['pktOrderServId', 'ppid', 'pkid', 'cond'],
        1,
        2,
        "PK_HNDR_PKT_ORDER"
    );
    dataGrid.setValidationRules('pktOrderServId', 'required', 'Service Id를 입력해주세요');
    dataGrid.setValidationRules('pkid', 'required', 'Pkid를 입력해주세요');
    dataGrid.setEditingTexts("PK_HNDR_PKT_ORDER", "이 항목을 삭제하시겠습니까?");

    dataGrid.onInitNewRow = function(e) {
        const filterSelectBox = $("#pktOrderSelectBox").dxSelectBox("instance");
        let valueFromFilter = filterSelectBox ? filterSelectBox.option("value") : "";
        const valueToSet = (valueFromFilter === "" || valueFromFilter === null || valueFromFilter === undefined) ? selectedServiceId : valueFromFilter;

        if (valueToSet) {
            e.data.pktOrderServId = valueToSet;
        }

    };

    dataGrid.onEditorPreparing = function (e) {
        if (e.parentType !== "dataRow") {
            return;
        }

        // 수정 모드일 때 특정 필드들을 읽기 전용으로 설정
        if (!e.row.isNewRow) {
            if (e.dataField === "pktOrderServId" || e.dataField === "pkid") {
                e.editorOptions.readOnly = true;
                return; // 읽기 전용이므로 아래 로직은 필요 없음
            }
        }

        // 등록 모드일 때 SelectBox 설정
        if (e.dataField === "pktOrderServId") {
            e.editorName = "dxSelectBox";
            e.editorOptions.dataSource = pktServiceIds;
            e.editorOptions.placeholder = "Select...";

            const grid = e.component;
            const rowIndex = e.row.rowIndex;
            const defaultOnValueChanged = e.editorOptions.onValueChanged;

            e.editorOptions.onValueChanged = function(editorArgs) {
                defaultOnValueChanged.apply(this, arguments);
                grid.cellValue(rowIndex, 'pkid', null);
            };
        }

        if (e.dataField === "pkid") {
            const currentServId = e.row.data.pktOrderServId;
            e.editorName = "dxSelectBox";
            e.editorOptions.disabled = !currentServId;
            e.editorOptions.placeholder = "Select...";

            if (currentServId) {
                e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                    loadMode: "raw",
                    load: function () {
                        return $.ajax({
                            url: "thoth/pktDefList",
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify({ pktDefServId: currentServId })
                        }).then(response => {
                            if (Array.isArray(response)) {
                                return [...new Set(response.map(item => item.pkid))]; // 중복 제거
                            }
                            return [];
                        });
                    }
                });
            } else {
                e.editorOptions.dataSource = [];
            }
        }
    };


    const refreshGrid = (pktOrderServId) => pktOrderList(pktOrderServId);

    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktOrder/insert", data, deferred, pktOrderGrid, () => {
            refreshGrid(data.pktOrderServId);
            $("#pktOrderSelectBox").dxSelectBox("instance").option("value",data.pktOrderServId);
        });
    });

    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktOrder/update", data, deferred, pktOrderGrid, () => {
            refreshGrid(data.pktOrderServId);
            $("#pktOrderSelectBox").dxSelectBox("instance").option("value",data.pktOrderServId);
        });
    });

    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktOrder/delete", data, deferred, pktOrderGrid, () => {
            refreshGrid(data.pktOrderServId);
            $("#pktOrderSelectBox").dxSelectBox("instance").option("value",data.pktOrderServId);
        });
    });

    pktOrderGrid = $('#pktOrderGrid').dxDataGrid(dataGrid).dxDataGrid("instance");
}

// PK_HNDR_PKT_ORDER 팝업 안 그리드 리스트 받아오기
function pktOrderList(pktOrderServId){
    $.ajax({
        url: "thoth/pktOrderList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ pktOrderServId }),
        success(res) {
            pktOrderGrid.option("dataSource", res);
        },
        complete() {
            pktOrderGrid.endCustomLoading();
        }
    });
}