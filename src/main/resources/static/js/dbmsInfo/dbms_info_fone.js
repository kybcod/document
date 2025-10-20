function dbmsNameFoneSelectBox() {
    $.ajax({
        url: "dbms/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success: function(result) {
            dbmsLookupData = result.map(r => ({ ID: r.name, Name: r.name }));
            dbmsLoadInfoFoneDataGridSetting();
        }
    });
}



// DBMS 데이터 받아오기
function getDbmsLoadInfoFoneList() {
    $.ajax({
        url: "dbms/load-info",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            dbmsLoadInfoFoneGrid.option("dataSource", res);
        },
        complete(){
            dbmsLoadInfoFoneGrid.endCustomLoading();
        }
    });
}

// FONE 그리드 세팅
function dbmsLoadInfoFoneDataGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['dbkd','name', 'dnam', 'host', 'addr', 'unam', 'pass', 'snam', 'scpt', 'cmmt', 'use', 'cdat', ''];
    let captions = ['DB','Group Name', 'Directory', 'Host', 'Ip', 'User', 'Pass', 'Instance', 'Script', 'Comment', 'Use', 'Date', ''];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(14);
    dataGrid.setEditing("popup", true, true, true);   // 추가, 수정, 삭제 모두 가능
    dataGrid.setEditingTexts("DBMS Information", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("DBMS Information", 700, 500);
    dataGrid.setEditingForm(
        ['dbkd', 'name', 'dnam', 'host', 'addr', 'unam', 'pass', 'snam', 'scpt', 'use',['cmmt', 120]],
        2,
        2,
        "DBMS Information"
    );

    dataGrid.setValidationRules('dbkd', 'required', 'DB명을 입력해주세요');
    dataGrid.setValidationRules('name', 'required', '그룹명을 입력해주세요');
    dataGrid.setValidationRules('addr', 'required', '주소를 입력해주세요');
    dataGrid.setValidationRules('unam', 'required', 'USER명을 입력해주세요');
    dataGrid.setValidationRules('pass', 'required', '비밀번호를 입력해주세요');

    // 등록/수정 시 name 필드 활성화/비활성화 처리
    dataGrid.setColumnReadOnly("name")

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/insert", data, deferred, dbmsLoadInfoFoneGrid, getDbmsLoadInfoFoneList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/update", data, deferred, dbmsLoadInfoFoneGrid, getDbmsLoadInfoFoneList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/delete", data, deferred, dbmsLoadInfoFoneGrid, getDbmsLoadInfoFoneList);
    });

    dbmsLoadInfoFoneGrid = $('#dbmsListGridFone').dxDataGrid(dataGrid).dxDataGrid("instance");

    dbmsLoadInfoFoneGrid.beginCustomLoading();

    dbmsLoadInfoFoneGrid.option("toolbar.items", [
        {
            location: "before",
            widget: "dxButton",
            options: {
                icon: "refresh",
                text: "System Restart",
                onClick: function() {
                    systemRestart();
                }
            }
        },
        {
            location: "before",
            widget: "dxButton",
            options: {
                icon: "add",
                text: "USER_SERV",
                onClick: function() {
                    openCommonUserServPopup({
                        popupContainerId: "userServPopupContainer",
                        gridId: "userServFoneGrid",
                        selectBoxId: "userServFoneSelectBox",
                        initialPkgId: "USV",
                        gridInstanceHolder: {
                            get instance() { return userServFoneGrid; },
                            set instance(v) { userServFoneGrid = v; }
                        }
                    });
                }
            }
        },
        "addRowButton",
        {
            location: "after",
            widget: "dxButton",
            options: {
                icon: "check",
                text: "TEST",
                onClick: function() {
                    dbConnectionTest(dbmsLoadInfoFoneGrid.getSelectedRowsData()[0]);  // 클릭 시 함수 호출
                }
            }
        }
    ]);

}

// 디비 연결 테스트
function dbConnectionTest(selectedData) {

    if (!selectedData) {
        basicAlert({ icon: 'error', text: '데이터를 가져올 수 없습니다!' });
        return;
    }

    $.ajax({
        url: "dbms/connection",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(selectedData),
        dataType: "json",
        success(res) {
            basicAlert({ icon: 'success', text: res.message });
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        }
    });
}


// 시스템 재시작
function systemRestart(data, callback){

    let selectedData = data || {};

    $.ajax({
        url: "dbms/restart",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(selectedData),
        success(res) {
            basicAlert({ icon: 'success', text: res.message });
        },
        error(err, xhr) {
            basicAlert({ icon: 'error', text: err.responseJSON?.message || err.responseText.message });
        },
        complete() {
            if (callback) callback();
        }
    });
}
