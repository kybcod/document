
// PK_HNDR_PKT_DEF 팝업 열기
function openPkgDefPopup() {
    $("#edgePktDefPopup").dxPopup({
        visible: true,
        showTitle: true,
        title: "PK_HNDR_PKT_DEF",
        width: 1000,
        height: 700,
        contentTemplate: function(container) {
            container.empty();

            const selectBoxContainer = $("<div>").css({ marginBottom: "10px" }).appendTo(container);
            const selectBoxData = [{ text: "전체", value: "" }, ...pktServiceIds.map(id => ({ text: id, value: id }))];
            const initialValue = selectedServiceId ? selectedServiceId : "";

            $("<div>")
                .attr("id", "pktDefSelectBox")
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
                        pktDefList(selectServId);
                    }
                });

            // 팝업 열릴 때 전체 기준으로 1회 호출
            pktDefList(initialValue);

            // 그리드 삽입
            $("<div>")
                .attr("id", "pktDefGrid")
                .appendTo(container);

            pktDefGridSetting();
        },
    });
}


// PK_HNDR_PKT_DEF 팝업 안 그리드
function pktDefGridSetting(){
    let dataGrid = new dxdatagrid();
    let columns = ['pktDefServId', 'pkid', 'body'];
    let captions = ['Service Id', 'Pkid', 'Body']
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(10);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingPopup("PK_HNDR_PKT_DEF", 400, 400);
    dataGrid.setEditingForm(
        ['pktDefServId', 'pkid', ['body', 120]],
        1,
        2,
        "PK_HNDR_PKT_DEF"
    );
    dataGrid.setColumnReadOnly('pktDefServId', 'pkid');
    dataGrid.setValidationRules('pktDefServId', 'required', 'Service Id를 입력해주세요');
    dataGrid.setValidationRules('pkid', 'required', 'Pkid를 입력해주세요');
    dataGrid.setEditingTexts("PK_HNDR_PKT_DEF", "이 항목을 삭제하시겠습니까?");

    dataGrid.onInitNewRow = function(e) {
        const filterSelectBox = $("#pktDefSelectBox").dxSelectBox("instance");
        let valueFromFilter = filterSelectBox ? filterSelectBox.option("value") : "";
        const valueToSet = (valueFromFilter === "" || valueFromFilter === null || valueFromFilter === undefined) ? selectedServiceId : valueFromFilter;
        if (valueToSet) {
            e.data.pktDefServId = valueToSet;
        }
    };

    dataGrid.onEditorPreparing = function (e) {
        if (e.parentType !== "dataRow") {
            return;
        }

        // 수정 모드일 때 특정 필드들을 읽기 전용으로 설정
        if (!e.row.isNewRow) {
            if (e.dataField === "pktDefServId" || e.dataField === "pkid" ) {
                e.editorOptions.readOnly = true;
                return; // 읽기 전용이므로 아래 로직은 필요 없음
            }
        }

        // 등록 모드일 때 SelectBox 설정
        if (e.dataField === "pktDefServId") {
            e.editorName = "dxSelectBox";
            e.editorOptions.dataSource = pktServiceIds;
            e.editorOptions.placeholder = "Select...";
        }
    };


    const refreshGrid = (pktDefServId) => pktDefList(pktDefServId);

    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktDef/insert", data, deferred, pktDefGrid, () => {
            refreshGrid(data.pktDefServId);
            $("#pktDefSelectBox").dxSelectBox("instance").option("value",data.pktDefServId);
        });
    });

    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktDef/update", data, deferred, pktDefGrid, () => {
            refreshGrid(data.pktDefServId);
            $("#pktDefSelectBox").dxSelectBox("instance").option("value",data.pktDefServId);
        });
    });

    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/pktDef/delete", data, deferred, pktDefGrid, () => {
            refreshGrid(data.pktDefServId);
            $("#pktDefSelectBox").dxSelectBox("instance").option("value",data.pktDefServId);
        });
    });

    pktDefGrid = $('#pktDefGrid').dxDataGrid(dataGrid).dxDataGrid("instance");
}

// PK_HNDR_PKT_DEF 팝업 안 그리드 리스트 받아오기
function pktDefList(pktDefServId){
    $.ajax({
        url: "thoth/pktDefList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ pktDefServId }),
        success(res) {
            pktDefGrid.option("dataSource", res);
        },
        complete() {
            pktDefGrid.endCustomLoading();
        }
    });
}