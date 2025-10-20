function dbmsNameThothSelectBox() {
    $.ajax({
        url: "dbms/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success: function(result) {
            dbmsLookupData = result.map(r => ({ ID: r.name, Name: r.name }));
            dbmsLoadInfoThothDataGridSetting();
        }
    });
}



// DBMS 데이터 받아오기
function getDbmsLoadInfoThothList() {
    $.ajax({
        url: "dbms/load-info",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            dbmsLoadInfoThothGrid.option("dataSource", res);
        },
        complete(){
            dbmsLoadInfoThothGrid.endCustomLoading();
        }
    });
}

// Tdbms 그리드 세팅
function dbmsLoadInfoThothDataGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['dbkd','name', 'dnam', 'host', 'addr', 'unam', 'pass', 'snam', 'scpt', 'cmmt', 'use', 'cdat', 'system'];
    let captions = ['DB','Group Name', 'Directory', 'Host', 'Ip', 'User', 'Pass', 'Instance', 'Script', 'Comment', 'Use', 'Date','System'];
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
        sendDbmsDataToServer("dbms/load-info/insert", data, deferred, dbmsLoadInfoThothGrid, getDbmsLoadInfoThothList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/update", data, deferred, dbmsLoadInfoThothGrid, getDbmsLoadInfoThothList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/delete", data, deferred, dbmsLoadInfoThothGrid, getDbmsLoadInfoThothList);
    });

    dbmsLoadInfoThothGrid = $('#dbmsListGridThoth').dxDataGrid(dataGrid).dxDataGrid("instance");

    dbmsLoadInfoThothGrid.beginCustomLoading();

    dbmsLoadInfoThothGrid.option("toolbar.items", [
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
                        popupContainerId: "userServThothPopup",
                        gridId: "userServThothGrid",
                        selectBoxId: "userServSelectBox",
                        initialPkgId: "USV",
                        gridInstanceHolder: {
                            get instance() { return userServThothGrid; },
                            set instance(v) { userServThothGrid = v; }
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
                    dbConnectionTest(dbmsLoadInfoThothGrid.getSelectedRowsData()[0]);  // 클릭 시 함수 호출
                }
            }
        }
    ]);

}

// USER_SERV FONE 그리드 세팅
function userServThothGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['upkgId','grpId', 'enable', 'kind', 'noproc', 'path', 'optPrm'];
    let captions = ['PKG_ID','GRP_ID', 'ENABLE', 'KIND', 'NOPROC', 'PATH', 'OPT_PRM'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(10);
    dataGrid.setEditing("row", true, true, true);   // 추가, 수정, 삭제 모두 가능
    dataGrid.setEditingTexts("USER_SERV", "이 항목을 삭제하시겠습니까?");
    dataGrid.setValidationRules('upkgId', 'required', 'PKG_ID를 입력해주세요');
    dataGrid.setValidationRules('grpId', 'required', 'GRP_ID를 입력해주세요');


    // 수정 시 name 필드 활성화/비활성화 처리
    dataGrid.setColumnReadOnly("upkgId", "grpId")

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("dbms/user-serv/insert", data, deferred, userServThothGrid,
            function() {
                dataLoadFunc(data.upkgId);
            }
        );
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("dbms/user-serv/update", data, deferred, userServThothGrid,
            function() {
                dataLoadFunc(data.upkgId);
            }
        )
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("dbms/user-serv/delete", data, deferred, userServThothGrid,
            function() {
                dataLoadFunc(data.upkgId);
            }
        )
    });

    userServThothGrid = $('#userServThothGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    userServThothGrid.beginCustomLoading();


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