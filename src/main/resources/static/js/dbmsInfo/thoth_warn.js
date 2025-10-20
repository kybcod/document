// ServiceId selectBox 설정
function getWarnServIdList() {
    $.ajax({
        url: "thoth/servIdList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            // serviceId 목록 추출
            const serviceIdList = res.map(item => item.serviceId);

            const $selectBox = $("#serviceIdWarn");
            $selectBox.empty();
            $selectBox.append(`<option value="">전체</option>`);

            serviceIdList.forEach(id => {
                $selectBox.append(`<option value="${id}">${id}</option>`);
            });

            $selectBox.val("");
            getWarnLevelList("");
            getWarnInfoList("");
            getWarnSnsInfoList("");

            // 선택 변경 시마다 리스트 재호출
            $selectBox.off("change").on("change", function() {
                const selectedId = $(this).val();
                getWarnLevelList(selectedId);
                getWarnInfoList(selectedId);
                getWarnSnsInfoList(selectedId);
            });
        },
        error() {
            console.error("Service ID 목록을 불러오지 못했습니다.");
        }
    });
}


// [첫번째 그리드] PK_WARN_LEVEL 리스트
function getWarnLevelList(serviceId) {

    $.ajax({
        url: "thoth/warn/levelList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({serviceId}),
        success(res) {
            warnLevelGrid.option("dataSource", res);
        },
        complete() {
            warnLevelGrid.endCustomLoading();
        }
    });
}

// [첫번째 그리드] PK_WARN_LEVEL
function warnLevelGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['serviceId', 'pkid', 'actId', 'errNo', 'errLevel', 'stayTime', 'regDate'];
    dataGrid.setColumns(columns);
    dataGrid.setPaging(3);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingTexts("PK_WARN_LEVEL", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("PK_WARN_LEVEL", 700, 400);
    dataGrid.setEditingForm(
        ['serviceId', 'pkid', 'actId', 'errNo', 'errLevel', 'stayTime'],
        2,
        2,
        "PK_WARN_LEVEL",
    );

    dataGrid.setValidationRules('serviceId', 'required', '서비스 아이디를 선택해주세요');
    dataGrid.setValidationRules('pkid', 'required', 'PKID를 선택해주세요');
    dataGrid.setValidationRules('actId', 'required', 'ACT ID를 선택해주세요');

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/levelInsert", data, deferred, warnLevelGrid, getWarnLevelList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/levelUpdate", data, deferred, warnLevelGrid, getPkServIdList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/levelDelete", data, deferred, warnLevelGrid, getWarnLevelList);
    });


    dataGrid.onEditorPreparing = function (e) {
        if (e.parentType !== "dataRow") {
            return;
        }

        // 수정 모드일 때 특정 필드들을 읽기 전용으로 설정
        if (!e.row.isNewRow) {
            if (e.dataField === "serviceId" || e.dataField === "pkid" || e.dataField === "actId") {
                e.editorOptions.readOnly = true;
                return; // 읽기 전용이므로 아래 로직은 필요 없음
            }
        }

        const grid = e.component;
        const rowIndex = e.row.rowIndex;
        const defaultOnValueChanged = e.editorOptions.onValueChanged;

        // 등록 모드일 때 SelectBox 설정
        if (e.dataField === "serviceId") {
            e.editorName = "dxSelectBox";
            e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                loadMode: "raw",
                load: function () {
                    return $.ajax({
                        url: "thoth/pktActListByPkid",
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        data : JSON.stringify({})
                    }).then(response => {
                        if (Array.isArray(response)) {
                            return [...new Set(response.map(item => item.pktActServId))]; // 중복 제거
                        }
                        return [];
                    });
                }
            });


            e.editorOptions.onValueChanged = function(editorArgs) {
                defaultOnValueChanged.apply(this, arguments);
                grid.cellValue(rowIndex, 'pkid', null);
            };
        }

        if (e.dataField === "pkid") {
            const currentServId = e.row.data.serviceId;
            e.editorName = "dxSelectBox";
            e.editorOptions.disabled = !currentServId;

            if (currentServId) {
                e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                    loadMode: "raw",
                    load: function () {
                        return $.ajax({
                            url: "thoth/pktActListByPkid",
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify({ pktActServId: currentServId })
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

            e.editorOptions.onValueChanged = function(editorArgs) {
                defaultOnValueChanged.apply(this, arguments);
                grid.cellValue(rowIndex, 'actId', null);
            };
        }

        if (e.dataField === "actId") {
            const currentServId = e.row.data.serviceId;
            const currentPkId = e.row.data.pkid;
            e.editorName = "dxSelectBox";
            e.editorOptions.disabled = !currentServId;

            if (currentServId) {
                e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                    loadMode: "raw",
                    load: function () {
                        return $.ajax({
                            url: "thoth/pktActListByPkid",
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify({
                                pktActServId: currentServId,
                                pkid: currentPkId
                            })
                        }).then(response => {
                            if (Array.isArray(response)) {
                                return [...new Set(response.map(item => item.actId))]; // 중복 제거
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

    warnLevelGrid = $('#warnLevelGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    warnLevelGrid.beginCustomLoading();
}



// [두번째 그리드] PK_WARN_INFO 리스트
function getWarnInfoList(serviceId) {

    $.ajax({
        url: "thoth/warn/infoList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({serviceId}),
        success(res) {
            warnInfoGrid.option("dataSource", res);
        },
        complete() {
            warnInfoGrid.endCustomLoading();
        }
    });
}

// [두번째 그리드] PK_WARN_INFO
function warnInfoGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['serviceId', 'pkid', 'data', 'warnNo', 'warnLevel', 'stayTime', 'warnDone', 'stime','etime'];
    dataGrid.setColumns(columns);
    dataGrid.setPaging(3);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingTexts("PK_WARN_INFO", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("PK_WARN_INFO", 700, 400);
    dataGrid.setEditingForm(
        ['serviceId', 'pkid',  'warnNo', 'warnLevel', 'stayTime', 'warnDone', 'stime','etime', ['data',120]],
        2,
        2,
        "PK_WARN_INFO",
    );

    dataGrid.setValidationRules('serviceId', 'required', '서비스 아이디를 선택해주세요');
    dataGrid.setValidationRules('pkid', 'required', 'PKID를 선택해주세요');

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/infoInsert", data, deferred, warnInfoGrid, getWarnInfoList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/infoUpdate", data, deferred, warnInfoGrid, getWarnInfoList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/infoDelete", data, deferred, warnInfoGrid, getWarnInfoList);
    });


    dataGrid.onEditorPreparing = function (e) {
        if (e.parentType !== "dataRow") {
            return;
        }

        // 수정 모드일 때 특정 필드들을 읽기 전용으로 설정
        if (!e.row.isNewRow) {
            if (e.dataField === "serviceId" || e.dataField === "pkid") {
                e.editorOptions.readOnly = true;
                return; // 읽기 전용이므로 아래 로직은 필요 없음
            }
        }

        const grid = e.component;
        const rowIndex = e.row.rowIndex;
        const defaultOnValueChanged = e.editorOptions.onValueChanged;

        // 등록 모드일 때 SelectBox 설정
        if (e.dataField === "serviceId") {
            e.editorName = "dxSelectBox";
            e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                loadMode: "raw",
                load: function () {
                    return $.ajax({
                        url: "thoth/pktActListByPkid",
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        data : JSON.stringify({})
                    }).then(response => {
                        if (Array.isArray(response)) {
                            return [...new Set(response.map(item => item.pktActServId))]; // 중복 제거
                        }
                        return [];
                    });
                }
            });


            e.editorOptions.onValueChanged = function(editorArgs) {
                defaultOnValueChanged.apply(this, arguments);
                grid.cellValue(rowIndex, 'pkid', null);
            };
        }

        if (e.dataField === "pkid") {
            const currentServId = e.row.data.serviceId;
            e.editorName = "dxSelectBox";
            e.editorOptions.disabled = !currentServId;

            if (currentServId) {
                e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                    loadMode: "raw",
                    load: function () {
                        return $.ajax({
                            url: "thoth/pktActListByPkid",
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify({ pktActServId: currentServId })
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

    warnInfoGrid = $('#warnInfoGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    warnInfoGrid.beginCustomLoading();
}




// [세번째 그리드] PK_WARN_SNS_INFO 리스트
function getWarnSnsInfoList(serviceId) {

    $.ajax({
        url: "thoth/warn/snsInfoList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({serviceId}),
        success(res) {
            warnSnsGrid.option("dataSource", res);
        },
        complete() {
            warnSnsGrid.endCustomLoading();
        }
    });
}

// [세번째 그리드] PK_WARN_SNS_INFO
function warnSnsGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['workerId', 'worker', 'deptId', 'snsPeriod', 'serviceId', 'pksq', 'noSns', 'regDate'];
    dataGrid.setColumns(columns);
    dataGrid.setPaging(3);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingTexts("PK_WARN_SNS_INFO", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("PK_WARN_SNS_INFO", 700, 400);
    dataGrid.setEditingForm(
        ['workerId', 'worker', 'deptId', 'snsPeriod', 'serviceId', 'pksq', 'noSns'],
        2,
        2,
        "PK_WARN_SNS_INFO",
    );

    dataGrid.setValidationRules('workerId', 'required', '서비스 아이디를 선택해주세요');

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/snsInsert", data, deferred, warnSnsGrid, getWarnSnsInfoList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/snsUpdate", data, deferred, warnSnsGrid, getWarnSnsInfoList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/warn/snsDelete", data, deferred, warnSnsGrid, getWarnSnsInfoList);
    });


    dataGrid.onEditorPreparing = function (e) {
        if (e.parentType !== "dataRow") {
            return;
        }

        // 수정 모드일 때 특정 필드들을 읽기 전용으로 설정
        if (!e.row.isNewRow) {
            if (e.dataField === "workerId") {
                e.editorOptions.readOnly = true;
                return; // 읽기 전용이므로 아래 로직은 필요 없음
            }
        }

        // 등록 모드일 때 SelectBox 설정
        if (e.dataField === "serviceId") {
            e.editorName = "dxSelectBox";
            e.editorOptions.dataSource = new DevExpress.data.CustomStore({
                loadMode: "raw",
                load: function () {
                    return $.ajax({
                        url: "thoth/pktActListByPkid",
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        data : JSON.stringify({})
                    }).then(response => {
                        if (Array.isArray(response)) {
                            return [...new Set(response.map(item => item.pktActServId))]; // 중복 제거
                        }
                        return [];
                    });
                }
            });

        }

    };

    warnSnsGrid = $('#warnSnsGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    warnSnsGrid.beginCustomLoading();
}
