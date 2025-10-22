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

// USER 그리드 세팅
function userInfoDataGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['userId','userName', 'userTel', 'userEmail', 'userFlag', 'permitId', 'pwdFcnt', 'crtId', 'crtDt', 'userPass'];
    let captions = ['아이디','이름', '전화번호', '이메일', '사용구분', '권한아이디', '비번실패횟수', '등록자', '생성일','암호'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.columns.find(c => c.dataField === 'userTel').customizeText = function(cellInfo) {
        if (!cellInfo.value) return '';
        let value = cellInfo.value.replace(/\D/g, '');
        let result = '';
        if (value.length < 4) {
            result = value;
        } else if (value.length < 8) {
            result = value.substring(0, 3) + '-' + value.substring(3);
        } else if (value.length < 11) {
            result = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
        } else {
            result = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
        }
        return result;
    };
    dataGrid.columns.find(c => c.dataField === 'userPass').visible = false;
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingTexts("사용자 관리", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("사용자 관리", 700, 400);
    dataGrid.setEditingForm(
        ['userId','userName', 'userTel', 'userEmail', 'userFlag', 'permitId', 'userPass'],
        2,
        2,
        "사용자 관리",
    );
    dataGrid.setValidationRules('userId', 'required', '사용자 아이디를 입력해주세요');
    dataGrid.setValidationRules('userTel', 'required', '핸드폰을 입력해주세요');
    dataGrid.setValidationRules(
        'userTel',
        'pattern',
        '휴대폰 번호 형식은 01x-xxxx-xxxx 이어야 합니다.',
        /^\d{3}-\d{4}-\d{4}$/
    );
    dataGrid.setValidationRules('permitId', 'required', '권한 아이디를 입력해주세요');



    dataGrid.setOnEditorPreparing(function(e) {
        if (e.parentType !== 'dataRow') {
            return;
        }

        // permitId 필드를 dxSelectBox로 설정
        if (e.dataField === "permitId") {
            e.editorName = "dxSelectBox";
            e.editorOptions.dataSource = menuLookupData;
            e.editorOptions.valueExpr = "ID";
            e.editorOptions.displayExpr = "Name";
            e.editorOptions.placeholder = "Select...";
            e.editorOptions.onValueChanged = function (args) {
                e.setValue(args.value);
            };
        }

        if (e.dataField === 'userTel') {
            e.editorOptions.onInput = function(args) {
                let input = args.event.target;
                let value = input.value.replace(/\D/g, '');
                let result = '';
                if (value.length < 4) {
                    result = value;
                } else if (value.length < 8) {
                    result = value.substring(0, 3) + '-' + value.substring(3);
                } else if (value.length < 11) {
                    result = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
                } else {
                    result = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
                }
                input.value = result;
            };
        }

        // 기존 행 수정 시 userId는 읽기 전용으로 설정
        if (e.dataField === 'userId') {
            e.editorOptions.readOnly = !e.row.isNewRow;
        }

        // userPass 필드를 '비밀번호 초기화' 버튼으로 변경
        if (e.dataField === 'userPass') {
            if (e.row.isNewRow) {
                // 신규 등록 → 텍스트박스 + validator 적용
                e.editorName = 'dxTextBox';
                e.editorOptions.mode = 'password';
                e.editorOptions.validationRules = [
                    {
                        type: 'pattern',
                        pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
                        message: '비밀번호 규칙(영문+숫자+특수문자 8자리 이상)에 맞지 않습니다.',
                        ignoreEmptyValue : true
                    }
                ];
            } else {
                // 수정 → 버튼, validator 제거
                e.editorName = 'dxButton';
                e.editorOptions.text = '비밀번호 초기화';
                e.editorOptions.icon = 'preferences';
                e.editorOptions.onClick = function() {
                    openPwChangeModal(e.row.data.userId);
                };
                e.editorOptions.validationRules = []; // 버튼에는 validator 없음
            }
        }
    });

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDataToServer("user",'POST', data, deferred, userListGrid, getUserInfoList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDataToServer("user", 'PUT',data, deferred, userListGrid, getUserInfoList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDataToServer("user", 'DELETE',data, deferred, userListGrid, getUserInfoList);
    });

    dataGrid.setOnCellPrepared(function(e) {
        if (e.rowType === 'data' && e.column.dataField === 'pwdFcnt') {

            const $link = $('<a>')
                .text(e.data.pwdFcnt)
                .css({
                    'cursor': 'pointer',
                    'color': 'blue',
                    'text-decoration': 'underline'
                })
                .on('click', function() {
                    if (confirm('비밀번호 실패 횟수를 초기화하시겠습니까?')) {
                        sendDataToServer("user/updatePwdFcntZero", 'PUT', e.data, $.Deferred(), userListGrid, getUserInfoList);
                    }
                });

            e.cellElement.empty().append($link);
        }
    });

    userListGrid = $('#userListGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    userListGrid.beginCustomLoading();

}
