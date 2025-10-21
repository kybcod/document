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
    const docStatusCol = dataGrid.columns.find(c => c.dataField === 'docStatus');
    if (docStatusCol) {
        const docStatusMap = {
            0: '등록',
            1: '변환신청',
            2: '변환완료',
            9: '실패'
        };
        docStatusCol.customizeText = function(cellInfo) {
            return docStatusMap[cellInfo.value] || cellInfo.value;
        };
    }
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, false, true);
    dataGrid.setEditingTexts("문서 관리", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("문서 등록", 500, 400);
    dataGrid.setEditingForm(
        ['docName', '등록파일'],
        1,
        2,
        "문서 관리",
    );

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        const formData = new FormData();
        formData.append('docName', data.docName);

        // 파일 필드
        const fileUploader = $(".dx-fileuploader input[type='file']")[0];
        if (fileUploader && fileUploader.files.length > 0) {
            formData.append("file", fileUploader.files[0]);
        }

        // 전송
        $.ajax({
            url: 'doc',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                deferred.resolve();
                getDocList();
            },
            error: function(err) {
                deferred.reject();
                basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
            }
        });
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