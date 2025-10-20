let selectedPermitId = null;

// 사용자 데이터 받아오기
function getMenuAuthMgmtList() {
    $.ajax({
        url: "menu-auth/mgmtList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            menuAuthMgmtGrid.option("dataSource", res);
        },
        complete(){
            menuAuthMgmtGrid.endCustomLoading();
        }
    });
}

// 사용자 데이터 받아오기
function getMenuAuthInsertList() {

    $.ajax({
        url: "menu-auth/insertList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ permitId: selectedPermitId }),
        success(res) {
            menuAuthInsertTreeList.option("dataSource", res);
        },
        complete(){
            menuAuthInsertTreeList.endCustomLoading();
        }
    });
}

// 메뉴 권한 관리 그리드 세팅
function menuAuthMgmtDataGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['permitId','permitName'];
    dataGrid.setColumns(columns);
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, true, true);   // 추가, 수정, 삭제 모두 가능
    dataGrid.setEditingTexts("Menu Pkg Management", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("Menu Pkg Management", 400, 300);
    dataGrid.setEditingForm(
        ['permitId','permitName'],
        1,
        2,
        "Menu Pkg Management",
    );


    dataGrid.setValidationRules('permitId', 'required', '권한 아이디를 입력해주세요');
    dataGrid.setValidationRules('permitName', 'required', '권한명을 입력해주세요');

    dataGrid.setColumnReadOnly("permitId")

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("menu-auth/mgmtInsert", data, deferred, menuAuthMgmtGrid, getMenuAuthMgmtList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("menu-auth/mgmtUpdate", data, deferred, menuAuthMgmtGrid, getMenuAuthMgmtList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("menu-auth/mgmtDelete", data, deferred, menuAuthMgmtGrid, getMenuAuthMgmtList);
    });

    dataGrid.setOnRowClick(function(e){
      menuAuthInsertTreeList.beginCustomLoading();
      selectedPermitId = e.data.permitId;
      let data = { permitId : selectedPermitId };

      $.ajax({
          url: "menu-auth/insertList",
          type: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify(data),
          success(res) {
              menuAuthInsertTreeList.option("dataSource", res);
              menuAuthInsertTreeList.option("toolbar", {
                  visible: true,
                  items: [
                      {
                          location: "after",
                          widget: "dxButton",
                          options: {
                              icon: "plus",
                              onClick: function() {
                                  openMenuUsePopup(selectedPermitId);
                              }
                          }
                      }
                  ]
              });
              menuAuthInsertTreeList.repaint();
              getMenuUseList(selectedPermitId)
          },
          complete(){
              menuAuthInsertTreeList.endCustomLoading();
          }
      });
    });


    menuAuthMgmtGrid = $('#menuAuthMgmtGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    menuAuthMgmtGrid.beginCustomLoading();

}


// 메뉴 권한 등록 관리 그리드 세팅
function menuAuthInsertDataGridSetting() {

    let dataTreeList = new dxtreelist();
    let columns = ['permitId','permitName', 'menuName', 'menuId'];
    dataTreeList.setColumns(columns);
    dataTreeList.setId('menuId', 'menuGroup', '0000');
    dataTreeList.setHasItemsExpr("hasItemsExpr");
    dataTreeList.setEditing("popup", false, false, true);   // 추가, 수정, 삭제 모두 가능
    dataTreeList.setEditingTexts("Menu Pkg Registration Management", "이 항목을 삭제하시겠습니까?");
    dataTreeList.setEditingPopup("Menu Pkg Registration Management", 700, 500);
    dataTreeList.setColumnReadOnly("permitId")

    // 삭제
    dataTreeList.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("menu-auth/permitDetailDelete", data, deferred, menuAuthInsertTreeList, getMenuAuthInsertList);
    });

    menuAuthInsertTreeList = $('#menuAuthInsertGrid').dxTreeList(dataTreeList).dxTreeList("instance");

}






// 사용 가능한 메뉴 그리드 세팅
function menuUseDataGridSetting() {

    let dataTreeList = new dxtreelist();
    let columns = ['menuId','menuName', 'realUse'];
    dataTreeList.setColumns(columns);
    dataTreeList.setPaging(10);
    dataTreeList.setId('menuId', 'menuGroup', '0000');
    dataTreeList.setHasItemsExpr("hasItemsExpr");
    dataTreeList.setAutoPaging("#menuUsePopupGrid");

    menuUseTreeList = $('#menuUsePopupGrid').dxTreeList(dataTreeList).dxTreeList("instance");

    if(menuUseTreeList){
        menuUseTreeList.beginCustomLoading();
        getMenuUseList(selectedPermitId);
    }

}


// [팝업] 권한 아이디에서 사용하는 데이터 받아오기
function getMenuUseList(permitId) {
    $.ajax({
        url: "menu/useList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ permitId: permitId }),
        success(res) {
            if(menuUseTreeList){
                menuUseTreeList.option("dataSource", res);
                menuUseTreeList.option("onCellPrepared", function(e) {
                    if (e.rowType === "data" && e.column.dataField === "realUse") {
                        $(e.cellElement).empty();
                        $('<div />').dxCheckBox({
                            value: e.value === '1', // 초기값
                            onValueChanged: function(ev) {
                                const isChecked = ev.value;
                                const currentMenuId = e.data.menuId;

                                e.data.realUse = isChecked ? '1' : '0';

                                // 1. 하위 메뉴 모두 처리
                                const updateChildren = (parentId) => {
                                    res.forEach(item => {
                                        if (item.menuGroup === parentId) {
                                            item.realUse = isChecked ? '1' : '0';
                                            // 재귀적으로 하위 메뉴도 처리
                                            updateChildren(item.menuId);
                                        }
                                    });
                                };
                                updateChildren(currentMenuId);

                                // 2. 상위 메뉴 처리
                                const updateParents = (childItem) => {
                                    const parentId = childItem.menuGroup;
                                    if (!parentId || parentId === '0000') return;

                                    const parent = res.find(item => item.menuId === parentId);
                                    if (parent) {
                                        parent.realUse = '1'; // 상위는 무조건 체크 ON
                                        updateParents(parent); // 재귀적으로 상위 부모도 처리
                                    }
                                };
                                if (isChecked) {
                                    updateParents(e.data);
                                }

                                // 3. 데이터소스 다시 적용
                                menuUseTreeList.option("dataSource", res);
                            }
                        }).appendTo(e.cellElement);
                    }
                });

            }
        },
        complete(){
            if(menuUseTreeList){
                menuUseTreeList.endCustomLoading();
            }

        }
    });
}



function openMenuUsePopup(permitId) {
    $("#menuUsePopupContainer").dxPopup({
        visible: true,
        showTitle: true,
        title: "Menu Pkg Registration Management",
        width: 1000,
        height: 700,
        contentTemplate: function(container) {
            container.empty();
            $("<div>").attr("id", "menuUsePopupGrid").appendTo(container);
            menuUseDataGridSetting(permitId);
        },
        toolbarItems: [
            {
                toolbar: "bottom",
                location: "after",
                widget: "dxButton",
                options: {
                    text: "Save",
                    onClick: function() {
                        insertMenuAuthUse();
                    }
                }
            },
            {
                toolbar: "bottom",
                location: "after",
                widget: "dxButton",
                options: {
                    text: "Cancel",
                    onClick: function() {
                        $("#menuUsePopupContainer").dxPopup("hide");
                    }
                }
            }
        ],
    });
}

function insertMenuAuthUse(){

    let data = getSelectedMenuUseData();

    $.ajax({
        url: "menu-auth/menuUseinsert",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success(res, textStatus, xhr) {
            if(xhr.status === 200){
                $("#menuUsePopupContainer").dxPopup("hide");
                getMenuAuthInsertList();
            }
        },
        complete(){
            menuUseTreeList.endCustomLoading();
        }
    });
}

function getSelectedMenuUseData() {
    if (!menuUseTreeList) return [];

    const items = menuUseTreeList.getDataSource().items();
    const resultMap = new Map(); // menuId 기준으로 중복 제거

    function traverse(nodes) {
        nodes.forEach(node => {
            if (node.data && !resultMap.has(node.data.menuId)) {
                resultMap.set(node.data.menuId, {
                    permitId: selectedPermitId,
                    menuId: node.data.menuId,
                    menuName: node.data.menuName,
                    menuGroup: node.data.menuGroup,
                    realUse: node.data.realUse
                });
            }

            if (node.children && node.children.length > 0) {
                traverse(node.children);
            }
        });
    }

    traverse(items);
    return Array.from(resultMap.values());
}

