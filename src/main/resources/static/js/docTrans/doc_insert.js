// TB_DOCUMENT 리스트
function getDocList() {

    const startDate = $('#docInsertFrom').val().trim() || dateToString('start');
    const endDate = $('#docInsertTo').val().trim() || dateToString('end');

    $.ajax({
        url: "doc/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            docName: $("#docName").val().trim(),
            docStatus:  $("#docStatus").val().trim(),
            orgFilename: $("#orgFilename").val().trim(),
            startDate : startDate + " 00:00:00",
            endDate : endDate + " 23:59:59"
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
    let columns = ['docDt','docName', 'docStatus', 'look', 'transDt', 'crtId', 'orgFilename', 'saveFilename', 'docFilepath', 'ocryn', 'transHtml'];
    let captions = ['등록날짜','문서명', '변환상태', '보기', '변환작업일시', '등록자ID', '원본파일명', '저장파일명', '저장경로','OCR여부','변환HTML'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.columns.find(c => c.dataField === 'ocryn').visible = false;
    dataGrid.columns.find(c => c.dataField === 'transHtml').visible = false;
    const docStatusCol = dataGrid.columns.find(c => c.dataField === 'docStatus');
    if (docStatusCol) {
        const docStatusMap = {
            0: '등록',
            1: '변환신청',
            2: '변환완료',
            3: '변환보류',
            8: '파일없음',
            9: '실패'
        };
        docStatusCol.customizeText = function(cellInfo) {
            return docStatusMap[cellInfo.value] || cellInfo.value;
        };
    }
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, false, true);
    dataGrid.setEditingTexts("문서 관리", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("문서 등록", 400, 410);
    dataGrid.setEditingForm(
        ['docName', '등록파일', 'ocryn'],
        1,
        2,
        "문서 등록",
    );

    dataGrid.setOnInitNewRow(function(e) {
        e.data.ocryn = 0;
    });

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {

        const formData = new FormData();
        formData.append('docName', data.docName);
        formData.append('ocryn', data.ocryn ? 1 : 0);

        const allowedExtensions = [
            '.doc', '.docx', '.txt', '.xlx', '.xlxs',
            '.ppt', '.pptx', '.hwp', '.gif', '.jpeg', '.jpg', '.png', '.bmp', '.pdf'
        ];

        const fileUploader = $(".dx-fileuploader input[type='file']")[0];

        if (!fileUploader || fileUploader.files.length === 0) {
            basicAlert({ icon: 'error', text: '파일을 선택해주세요.' });
            deferred.reject();
            return;
        }

        // 파일 확장자 체크
        const fileName = fileUploader.files[0].name.toLowerCase();
        const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            basicAlert({
                icon: 'error',
                text: `지원하지 않는 파일 형식입니다.\n\n허용된 형식: ${allowedExtensions.join(', ')}`
            });
            fileUploader.value = ''; // 파일 선택 초기화
            deferred.reject();
            return;
        }

        formData.append("file", fileUploader.files[0]);


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
        sendDataToServer("doc", 'DELETE',data, deferred, docTransferGrid, getDocList);
    });

    dataGrid.setOnCellPrepared(function(e) {
        if (e.rowType === 'data' && e.column.dataField === 'look') {
            if (e.data.docStatus == 2) {
                $('<a>')
                    .addClass('dx-icon-search')
                    .css('cursor', 'pointer')
                    .attr('title', '보기')
                    .on('click', function() {
                        readFile(e.data.docId);
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
                    $resetBtn.addClass("disabled").css("pointer-events", "none").css("opacity", "0.5");
                    transfer(e.data, function() {
                        $resetBtn.removeClass("disabled").css("pointer-events", "").css("opacity", "");
                    });
                });
                $buttons.append($resetBtn);
            }
        }
    });
}

function transfer(data, callback){

    $.ajax({
        url: "doc/transfer",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success(res) {
            basicAlert({ icon: 'success', text: res });
            getDocList();
        },
        error: function(xhr, status, err) {
            basicAlert({ icon: 'error', text: xhr.responseJSON?.msg || xhr.responseText || err });
        },
        complete: function() {
            if (typeof callback === "function") callback();
        }

    });
}

function readFile(docId) {

    $.ajax({
        url: "doc/transHtml",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({docId}),
        success(res) {
            let htmlString = res.transHtml;

            $("#previewPopup").dxPopup({
                visible: true,
                title: "미리보기",
                width: "90%",
                height: "90%",
                showCloseButton: true,
                dragEnabled: true,
                resizeEnabled: true,
                contentTemplate: function(contentElement) {
                    const $content = $(contentElement);
                    $content.css('overflow-y', 'auto');
                    $content.append(htmlString);
                    $content.on('dxmousewheel', function(e) {
                        e.stopPropagation();
                    });
                },
                onHidden: function(e) {
                    e.component.dispose();
                }
            });
        },

    });

}