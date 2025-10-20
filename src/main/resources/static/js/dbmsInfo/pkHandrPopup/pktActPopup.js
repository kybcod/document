// PK_HNDR_PKT_ACT 팝업 열기
function openPkgActPopup() {
    $("#edgePktActPopup").dxPopup({
        visible: true,
        showTitle: true,
        title: "PK_HNDR_PKT_ACT",
        width: 1200,
        height: 700,
        contentTemplate: function(container) {
            container.empty();

            const selectBoxContainer = $("<div>").css({ marginBottom: "10px" }).appendTo(container);
            const selectBoxData = [{ text: "전체", value: "" }, ...pktServiceIds.map(id => ({ text: id, value: id }))];
            const initialValue = selectedServiceId ? selectedServiceId : "";

            $("<div>")
                .attr("id", "pktActSelectBox")
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
                        pktActList(selectServId);
                    }
                });

            // 팝업 열릴 때 전체 기준으로 1회 호출
            pktActList(initialValue);

            // 그리드 삽입
            $("<div>")
                .attr("id", "pktActGrid")
                .appendTo(container);

            pktActGridSetting();
        },
    });
}


// PK_HNDR_PKT_ACT 팝업 안 그리드
function pktActGridSetting(){
    let dataGrid = new dxdatagrid();
    let columns = ['pktActServId', 'pkid', 'actId', 'action', 'cond', 'setv', 'dnam', 'host', 'addr', 'unam', 'pass', 'snam', 'tnam', 'enable', 'sql'];
    let captions = ['Service Id', 'Pkid','Act Id', 'Action', 'Condition','Setv', 'DB Name', 'Host', 'Addr','Unam','Pass','Snam','Tnam','Enable','Sql'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(10);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingPopup("PK_HNDR_PKT_ACT", 700, 600);
    dataGrid.setEditingForm(
        ['pktActServId', 'pkid', 'actId', 'action', 'cond', 'setv', 'dnam', 'host', 'addr', 'unam', 'pass', 'snam', 'tnam', 'enable', 'sql'],
        2,
        2,
        "PK_HNDR_PKT_ACT"
    );
    dataGrid.setValidationRules('pktActServId', 'required', 'Service Id를 입력해주세요');
    dataGrid.setValidationRules('pkid', 'required', 'Pkid를 입력해주세요');
    dataGrid.setEditingTexts("PK_HNDR_PKT_ACT", "이 항목을 삭제하시겠습니까?");

    dataGrid.onInitNewRow = function(e) {
        const filterSelectBox = $("#pktActSelectBox").dxSelectBox("instance");
        let valueFromFilter = filterSelectBox ? filterSelectBox.option("value") : "";
        const valueToSet = (valueFromFilter === "" || valueFromFilter === null || valueFromFilter === undefined) ? selectedServiceId : valueFromFilter;
        if (valueToSet) {
            e.data.pktActServId = valueToSet;
        }
    };

    dataGrid.onEditorPreparing = function (e) {
        if (e.parentType !== "dataRow") {
            return;
        }

        // 수정 모드일 때 특정 필드들을 읽기 전용으로 설정
        if (!e.row.isNewRow) {
            if (e.dataField === "pktActServId" || e.dataField === "pkid" || e.dataField === "actId") {
                e.editorOptions.readOnly = true;
                return; // 읽기 전용이므로 아래 로직은 필요 없음
            }
        }

        // 등록 모드일 때 SelectBox 설정
        if (e.dataField === "pktActServId") {
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
            const currentServId = e.row.data.pktActServId;
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

    const refreshGrid = (pktActServId) => pktActList(pktActServId);

    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktAct/insert", data, deferred, pktActGrid, () => {
            refreshGrid(data.pktActServId);
            $("#pktActSelectBox").dxSelectBox("instance").option("value",data.pktActServId);
        });
    });

    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktAct/update", data, deferred, pktActGrid, () => {
            refreshGrid(data.pktActServId);
            $("#pktActSelectBox").dxSelectBox("instance").option("value",data.pktActServId);
        });
    });

    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktAct/delete", data, deferred, pktActGrid, () => {
            refreshGrid(data.pktActServId);
            $("#pktActSelectBox").dxSelectBox("instance").option("value",data.pktActServId);
        });
    });

    pktActGrid = $('#pktActGrid').dxDataGrid(dataGrid).dxDataGrid("instance");
}

// PK_HNDR_PKT_ACT 팝업 안 그리드 리스트 받아오기
function pktActList(pktActServId){
    $.ajax({
        url: "thoth/pktActList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ pktActServId }),
        success(res) {
            pktActGrid.option("dataSource", res);
        },
        complete() {
            pktActGrid.endCustomLoading();
        }
    });
}