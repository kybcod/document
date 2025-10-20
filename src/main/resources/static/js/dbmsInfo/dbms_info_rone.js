function dbmsNameRoneSelectBox() {
    $.ajax({
        url: "dbms/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success: function(result) {
            dbmsLookupData = result.map(r => ({ ID: r.name, Name: r.name }));
            dbmsLoadInfoRoneDataGridSetting();
        }
    });
}



// DBMS 데이터 받아오기
function getDbmsLoadInfoRoneList() {
    $.ajax({
        url: "dbms/load-info",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            dbmsRoneLoadInfoGrid.option("dataSource", res);
        },
        complete(){
            dbmsRoneLoadInfoGrid.endCustomLoading();
        }
    });
}

// DBMS 그리드 세팅
function dbmsLoadInfoRoneDataGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['dbkd','name', 'dnam', 'host', 'addr', 'unam', 'pass', 'snam', 'scpt', 'cmmt', 'use', 'cdat', 'system'];
    let captions = ['DB','Group Name', 'Directory', 'Host', 'Ip', 'User', 'Pass', 'Instance', 'Script', 'Comment', 'Use', 'Date' , 'System'];
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
        sendDbmsDataToServer("dbms/load-info/insert", data, deferred, dbmsRoneLoadInfoGrid, getDbmsLoadInfoRoneList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/update", data, deferred, dbmsRoneLoadInfoGrid, getDbmsLoadInfoRoneList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("dbms/load-info/delete", data, deferred, dbmsRoneLoadInfoGrid, getDbmsLoadInfoRoneList);
    });

    dbmsRoneLoadInfoGrid = $('#dbmsListGridRone').dxDataGrid(dataGrid).dxDataGrid("instance");

    dbmsRoneLoadInfoGrid.beginCustomLoading();

    dbmsRoneLoadInfoGrid.option("toolbar.items", [
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
                        popupContainerId: "userServRonePopupContainer",
                        gridId: "userServRoneGrid",
                        selectBoxId: "userServRoneSelectBox",
                        initialPkgId: "USV",
                        gridInstanceHolder: {
                            get instance() { return userServRoneGrid; },
                            set instance(v) { userServRoneGrid = v; }
                        }
                    });
                }
            }
        },
        "addRowButton",
        {
            location: "after",        // 오른쪽 끝에 위치
            widget: "dxButton",       // 버튼 생성
            options: {
                icon: "check",
                text: "TEST",       // 버튼 텍스트
                onClick: function() {
                    dbConnectionTest(dbmsRoneLoadInfoGrid.getSelectedRowsData()[0]);  // 클릭 시 함수 호출
                }
            }
        }
    ]);
}
