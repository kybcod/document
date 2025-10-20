// 메뉴 리스트 받아오기
function getMenuInfoList() {
    $.ajax({
        url: "menu/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            menuTreeList.option("dataSource", res);
        },
        complete(){
            menuTreeList.endCustomLoading();
        }
    });
}

// 메뉴 트리리스트 세팅
function menuInfoTreeListSetting() {

    let dataTreeList = new dxtreelist();
    let columns = ['menuId','menuName', 'menuGroup', 'menuDesc', 'menuUse', 'menuUrl', 'crtDt'];
    let captions = ['메뉴 아이디','메뉴명', '메뉴그룹', '메뉴설명', '사용', '메뉴경로', '생성일'];
    dataTreeList.setColumns(columns);
    dataTreeList.setCaptions(captions);
    dataTreeList.setPaging(15);
    dataTreeList.setId('menuId', 'menuGroup', '0000');
    dataTreeList.setHasItemsExpr("hasItemsExpr");
    dataTreeList.setEditing("popup", false, true, true);
    dataTreeList.setEditingTexts("메뉴 관리", "이 항목을 삭제하시겠습니까?");
    dataTreeList.setEditingPopup("메뉴 관리", 800, 400);
    dataTreeList.setEditingForm(
        ['menuId','menuName', 'menuUse', 'menuUrl', 'menuGroup', 'menuDesc'],
        2,
        2,
        "메뉴 관리",
    );
    dataTreeList.setAutoPaging("#menuTreeList");

    dataTreeList.setOnToolbarPreparing(function(e) {
        e.toolbarOptions.items.unshift({
          location: "after",
          widget: "dxButton",
          options: {
            icon: "plus",
            onClick: function() {
              menuTreeList.addRow();
            }
          }
        });
    });

    dataTreeList.setValidationRules('menuId', 'required', '메뉴명을 입력해주세요');
    dataTreeList.setValidationRules('menuGroup', 'required', '메뉴그룹을 입력해주세요');
    dataTreeList.onEditorPreparing = function(e) {
        // 데이터 행이고, 읽기 전용 필드 목록에 포함되는 경우
        if (e.parentType === "dataRow" && ["menuId"].includes(e.dataField)) {
            e.editorOptions.readOnly = !e.row.isNewRow;
        }

        if (e.parentType === "dataRow" && e.dataField === 'menuGroup' && e.row.isNewRow) {
            // 신규 행일 경우 초기값 강제로 빈값으로 세팅
            e.editorOptions.value = "";
        }
    };

    // 등록
    dataTreeList.setOnRowInserting(function(data, deferred) {
        sendDataToServer("menu",'POST', data, deferred, menuTreeList, getMenuInfoList);
    });

    // 수정
    dataTreeList.setOnRowUpdating(function(data, deferred) {
        sendDataToServer("menu",'PUT', data, deferred, menuTreeList, getMenuInfoList);
    });

    // 삭제
    dataTreeList.setOnRowRemoving(function(data, deferred) {
        sendDataToServer("menu",'DELETE', data, deferred, menuTreeList, getMenuInfoList);
    });

    menuTreeList = $('#menuTreeList').dxTreeList(dataTreeList).dxTreeList("instance");

    menuTreeList.beginCustomLoading();

}


