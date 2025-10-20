// 메뉴 권한 리스트 조회
function menuRoleSelectBox() {
    $.ajax({
        url: "menu-auth/mgmtList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success: function(result) {
            menuLookupData = result.map(r => ({ ID: r.permitId, Name: r.permitName }));
            userInfoDataGridSetting();
        }
    });
}

// 사용자 데이터 받아오기
function getUserInfoList() {
    $.ajax({
        url: "user/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            userListGrid.option("dataSource", res);
        },
        complete(){
            userListGrid.endCustomLoading();
        }
    });
}

// DBMS 그리드 세팅
function userInfoDataGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['userId','userName', 'companyName', 'deptName', 'position', 'pkgId', 'comTel', 'hpTelNo', 'mailAddr', 'creDate', 'userPass'];
    let captions = ['User Id','User Name', 'Company Name', 'Dept Name', 'Position', 'Pkg Id', 'Com Tel', 'Tel', 'Mail', 'DATE', 'User Pass'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.columns.find(c => c.dataField === 'userPass').visible = false;
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingTexts("User Management", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("User Management", 700, 400);
    dataGrid.setEditingForm(
        ['userId','userName', 'companyName', 'deptName', 'position', 'comTel', 'hpTelNo', 'mailAddr','pkgId', 'userPass'],
        2,
        2,
        "User Management",
    );
    dataGrid.setValidationRules('userId', 'required', '사용자 아이디를 입력해주세요');
    dataGrid.setValidationRules('hpTelNo', 'required', '핸드폰을 입력해주세요');
    dataGrid.setValidationRules(
        'hpTelNo',
        'pattern',
        '휴대폰 번호 형식은 01x-xxxx-xxxx 이어야 합니다.',
        /^\d{3}-\d{4}-\d{4}$/
    );

    dataGrid.setValidationRules('pkgId', 'required', '권한 아이디를 입력해주세요');
    dataGrid.setOnEditorPreparing(function(e) {
        // 기존 행 수정 시 userId는 읽기 전용으로 설정
        if (e.parentType === 'dataRow' && e.dataField === 'userId') {
            e.editorOptions.readOnly = !e.row.isNewRow; // 로직 수정
        }

        // userPass 필드를 '비밀번호 초기화' 버튼으로 변경
        if (e.parentType === 'dataRow' && e.dataField === 'userPass') {
            if (e.row.isNewRow) {
                // 등록 시에는 userPass 필드를 숨김 (DOM 조작)
                $(e.editorElement).closest('.dx-field-item').hide();
            } else {
                // 수정 시에는 '비밀번호 초기화' 버튼으로 표시
                e.editorName = 'dxButton';
                e.editorOptions.icon = 'preferences';
                e.editorOptions.text = '비밀번호 초기화';
                e.editorOptions.onClick = function() {
                    openPwChangeModal(e.row.data.userId); // 사용자 함수 호출
                };
            }
        }
    });

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("user/insert", data, deferred, userListGrid, getUserInfoList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("user/update", data, deferred, userListGrid, getUserInfoList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("user/delete", data, deferred, userListGrid, getUserInfoList);
    });

    userListGrid = $('#userListGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    userListGrid.beginCustomLoading();

}
