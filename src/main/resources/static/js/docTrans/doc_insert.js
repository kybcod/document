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
    const transHtmlCol = dataGrid.columns.find(c => c.dataField === 'transHtml');
    if (transHtmlCol) {
        transHtmlCol.visible = false;
        transHtmlCol.calculateCellValue = () => '';
    }
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
            return String(docStatusMap[cellInfo.value] ?? '');
        };
    }
    const ocrynCol = dataGrid.columns.find(c => c.dataField === 'ocryn');
    if (ocrynCol) {
        const ocrynMap = {
            0: ' ',
            1: '✓',
        };
        ocrynCol.width = 80;
        ocrynCol.customizeText = function(cellInfo) {
            return String(ocrynMap[cellInfo.value] ?? '');
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
    dataGrid.setOnRowInserting(function (data, deferred) {

        const formData = new FormData();
        formData.append("docName", data.docName ?? "");
        formData.append("ocryn", data.ocryn ? 1 : 0);

        const allowedExtensions = [
            '.doc', '.docx', '.txt', '.xls', '.xlsx', '.tiff',
            '.pptx', '.hwp', '.gif', '.jpeg', '.jpg', '.png', '.bmp', '.pdf'
        ];

        const allowedOcrExtensions = [
            '.gif', '.jpeg', '.jpg', '.png', '.bmp', '.tiff', '.pdf'
        ];

        const fileInput = $(".dx-fileuploader input[type='file']")[0];

        if (!fileInput || fileInput.files.length === 0) {
            basicAlert({ icon: 'error', text: '파일을 선택해주세요.' });
            deferred.reject();
            return;
        }

        for (let i = 0; i < fileInput.files.length; i++) {

            const file = fileInput.files[i];
            const fileName = file.name.toLowerCase();

            const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));
            const isOcrValid = allowedOcrExtensions.some(ext => fileName.endsWith(ext));

            if (!isValid) {
                basicAlert({
                    icon: 'error',
                    text: `지원하지 않는 파일 형식입니다.\n\n파일명: ${file.name}\n허용된 형식: ${allowedExtensions.join(', ')}`
                });
                deferred.reject();
                return;
            }

            if (data.ocryn && !isOcrValid) {
                basicAlert({
                    icon: 'error',
                    text: `OCR 불가능한 파일이 포함되어 있습니다.\n\n파일명: ${file.name}\n허용된 OCR 형식: ${allowedOcrExtensions.join(', ')}`
                });

                // OCR 체크 해제
                data.ocryn = 0;
                const ocrCheckBox = $(".dx-overlay-content .dx-checkbox")
                    .filter(function () {
                        return $(this).find(".dx-checkbox-text").text() === "OCR";
                    })
                    .dxCheckBox("instance");

                if (ocrCheckBox) {
                    ocrCheckBox.option("value", false);
                }

                deferred.reject();
                return;
            }
        }

        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append("files", fileInput.files[i]);
        }

        // 전송
        $.ajax({
            url: "doc",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function () {
                deferred.resolve(true);
                docTransferGrid.cancelEditData();
                getDocList();
            },
            error: function (err) {
                deferred.reject();
                basicAlert({
                    icon: 'error',
                    text: err.responseJSON?.msg || err.responseText
                });
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
    dataGrid.selection = {
        mode: "multiple",      // 다중 선택
        showCheckBoxesMode: "always", // 항상 체크박스 표시
        selectAllMode: "page"  // 현재 페이지 전체 선택
    };

    dataGrid.toolbar = {
        items: [
            {
                location: "before",
                widget: "dxButton",
                options: {
                    icon: "trash",
                    text: "일괄삭제",
                    onClick: function () {
                        bulkDelete();
                    }
                }
            },
            {
                location: "before",
                widget: "dxButton",
                options: {
                    icon: "refresh",
                    text: "실패문서 일괄변환",
                    onClick: function () {
                        bulkTransfer();
                    }
                }
            },
            "addRowButton" // 기존 문서 추가 (+) 버튼 유지
        ]
    };

    dataGrid.onSelectionChanging = function(e) {
        e.addedItems.forEach(item => {
            if (item.docStatus != 9) {
                e.component.deselectRows([item.docId]);
            }
        });
    };


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

function getSelectedRows() {
    return docTransferGrid.getSelectedRowsData();
}

function bulkDelete() {
    const selected = getSelectedRows();

    if (!selected || selected.length === 0) {
        basicAlert({ icon: 'warning', text: '선택된 문서가 없습니다.' });
        return;
    }

    const ok = confirm(`선택한 ${selected.length}건을 삭제하시겠습니까?`);
    if (!ok) return;

    docTransferGrid.beginCustomLoading("삭제 중...");

    $.ajax({
        url: "doc/bulk",
        type: "DELETE",
        contentType: "application/json",
        data: JSON.stringify(selected),
        success(res) {
            const successCnt = res?.successIds?.length || 0;
            const failCnt = res?.failList?.length || 0;

            if (failCnt === 0) {
                basicAlert({
                    icon: 'success',
                    text: `${successCnt}건 삭제 완료`
                });
            } else {
                basicAlert({
                    icon: 'warning',
                    text: `삭제 완료 ${successCnt}건 / 실패 ${failCnt}건`
                });
            }

            getDocList();
        },
        error(err) {
            basicAlert({
                icon: 'error',
                text: err.responseJSON?.msg || err.responseText
            });
        },
        complete() {
            docTransferGrid.endCustomLoading();
        }
    });
}



function bulkTransfer() {
    const selected = getSelectedRows();

    if (selected.length === 0) {
        basicAlert({ icon: 'warning', text: '선택된 문서가 없습니다.' });
        return;
    }

    const targets = selected.filter(d => d.docStatus == 9);

    if (targets.length === 0) {
        basicAlert({ icon: 'info', text: '변환 가능한 문서가 없습니다.' });
        return;
    }

    if (targets.length !== selected.length) {
        basicAlert({ icon: 'info', text: '변환 가능한 문서만 체크해주십시오.' });
        return;
    }

    docTransferGrid.beginCustomLoading("변환 중...");

    $.ajax({
        url: "doc/bulkTransfer",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(selected),
        success(res) {

            const successCnt = res?.successIds?.length || 0;
            const failList = res?.failList || [];
            const failCnt = failList.length;

            if (failCnt === 0) {
                basicAlert({
                    icon: 'success',
                    text: `${successCnt}건 변환 완료`
                });
            } else {
                let failText = `변환 완료: ${successCnt}건\n\n`;
                failText += `실패 내역\n`;

                failList.forEach((f, idx) => {
                    failText += `${idx + 1}. 문서ID: ${f.docId}\n`;
                    failText += `   사유: ${f.reason}\n\n`;
                });

                basicAlert({
                    icon: 'warning',
                    text: failText
                });
            }

            getDocList();
        },
        error(err) {
            basicAlert({
                icon: 'error',
                text: err.responseJSON?.msg || err.responseText
            });
        },
        complete() {
            docTransferGrid.endCustomLoading();
        }
    });
}
