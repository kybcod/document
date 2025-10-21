// TB_DOCUMENT 리스트
function getDocList() {

    $.ajax({
        url: "doc/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            docName: $("#docName").val(),
            docStatus:  $("#docStatus").val(),
            orgFilename: $("#orgFilename").val()
        }),
        success(res) {
            docTransferGrid.option("dataSource", res);
        },
        complete(){
            docTransferGrid.endCustomLoading();
        }
    });
}

// DOC_TRANS 그리드 세팅
function docTransGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['docDt','docName', 'docStatus', 'look', 'transDt', 'crtId', 'orgFilename', 'saveFilename', 'docFilepath'];
    let captions = ['등록날짜','문서명', '변환상태', '보기', '변환작업일시', '등록자ID', '원본파일명', '저장파일명', '저장경로'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, false, true);
    dataGrid.setEditingTexts("문서 관리", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("문서 관리", 700, 400);
    dataGrid.setEditingForm(
        ['docName','docFile'],
        1,
        2,
        "문서 관리",
    );

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDataToServer("doc",'POST', data, deferred, docTransferGrid, getUserInfoList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDataToServer("doc", 'DELETE',data, deferred, docTransferGrid, getUserInfoList);
    });

    dataGrid.setOnCellPrepared(function(e) {
        if (e.rowType === 'data' && e.column.dataField === 'look') {
            if (e.data.docStatus == 2) {
                $('<a>')
                    .addClass('dx-icon-search')
                    .css('cursor', 'pointer')
                    .attr('title', '보기')
                    .on('click', function() {
                        console.log('보기');
                    })
                    .appendTo(e.cellElement);
            }
        }
    });
    docTransferGrid = $('#docTransferGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    docTransferGrid.beginCustomLoading();

    docTransferGrid.on("rowPrepared", function(e) {
        if (e.rowType === "data" && e.data.docStatus == 9) {
            const $buttons = $(e.rowElement).find(".dx-command-edit");
            if ($buttons.length) {
                const $resetBtn = $('<div class="dx-link dx-icon-refresh" title="변환"></div>');
                $resetBtn.on("click", function() {
                    transfer(e.data);
                });
                $buttons.append($resetBtn);
            }
        }
    });
}

function transfer(data){
    console.log("변환 :", data);
}