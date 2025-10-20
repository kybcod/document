
function openRegiCheck(sour){
    loadContent("dbms_info/fone_regi_check", null, "tab-fone-regi-check", "REGI_CHECK");


    // tab-fone-source-regi 가 로드되면 후처리 실행
    $(document).one("tabLoaded", function (e, tabId) {
        if (tabId === "tab-fone-regi-check") {
            fnInSourGridSetting();
            getSourFnList();
            fnInTableGridSetting();
            getTableList(sour);
        }
    });

}

// 필드 그리드
function fieldFn() {

    if (!fnInTableGrid.getSelectedRowsData()[0]){
        basicAlert({ icon: 'error', text: "테이블을 선택해 주세요." });
        return;
    }

    fieldFnGridSetting();
    getFieldFnList()
}


// 인덱스 그리드
function indexFn() {

    if (!fnInTableGrid.getSelectedRowsData()[0]){
        basicAlert({ icon: 'error', text: "테이블을 선택해 주세요." });
        return;
    }

    indexFnGridSetting();
    getIndexFnList()
}


// 필드 그리드 세팅
function fieldFnGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['seq','sour','tnam', 'fnam', 'attr', 'use', 'regdate'];
    let captions = ['SEQ','SOUR','TNAM', 'FNAM', 'ATTR', 'USE', 'DATE'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(5);

    dataGrid.setEditing("popup", false, true, true);
    dataGrid.setEditingPopup("FN IN FILED", 350, 400);
    dataGrid.setEditingForm(
        ['sour','tnam', 'fnam', 'attr', 'use'],
        1,
        2,
        "FN IN FILED"
    );
    dataGrid.setEditingTexts("FN IN FILED", "이 항목을 삭제하시겠습니까?");

    dataGrid.setColumnReadOnly('sour', 'tnam');

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("fone/field/update", data, deferred, fieldIndexFNGrid, getFieldFnList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("fone/field/delete", data, deferred, fieldIndexFNGrid, getFieldFnList);
    });

    fieldIndexFNGrid = $('#fieldIndexGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    fieldIndexFNGrid.beginCustomLoading();

}

// 필드 리스트
function getFieldFnList() {

    let selectSour = fnInTableGrid.getSelectedRowsData()[0]?.sour || "";
    let selecttnam = fnInTableGrid.getSelectedRowsData()[0]?.tnam || "";

    $.ajax({
        url: "fone/field",
        type: "POST",
        contentType: "application/json",
        data : JSON.stringify({
            sour: selectSour,
            tnam: selecttnam,
        }),
        dataType: "json",
        success(res) {
            fieldIndexFNGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            fieldIndexFNGrid.endCustomLoading();
        }
    });
}

// 인덱스 그리드 세팅
function indexFnGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['seq','sour','tnam', 'inam', 'isUniq','fnams', 'use','regdate'];
    let captions = ['SEQ','SOUR','TNAM', 'INAM', 'UNIQ', 'FNAMS', 'USE', 'DATE'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(5);
    dataGrid.setEditing("popup", false, true, true);
    dataGrid.setEditingPopup("FN IN INDEX", 350, 450);
    dataGrid.setEditingForm(
        ['sour','tnam', 'inam', 'isUniq','fnams', 'use'],
        1,
        2,
        "FN IN INDEX"
    );
    dataGrid.setEditingTexts("FN IN INDEX", "이 항목을 삭제하시겠습니까?");

    dataGrid.setColumnReadOnly('sour', 'tnam');

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("fone/index/update", data, deferred, fieldIndexFNGrid, getIndexFnList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("fone/index/delete", data, deferred, fieldIndexFNGrid, getIndexFnList);
    });

    fieldIndexFNGrid = $('#fieldIndexGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    fieldIndexFNGrid.beginCustomLoading();

}

// 인덱스 리스트
function getIndexFnList() {

    let selectSour = fnInTableGrid.getSelectedRowsData()[0]?.sour || "";
    let selecttnam = fnInTableGrid.getSelectedRowsData()[0]?.tnam || "";

    $.ajax({
        url: "fone/index",
        type: "POST",
        contentType: "application/json",
        data : JSON.stringify({
            sour: selectSour,
            tnam: selecttnam,
        }),
        dataType: "json",
        success(res) {
            fieldIndexFNGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            fieldIndexFNGrid.endCustomLoading();
        }
    });
}



//  FN_IN_Sour 그리드 세팅
function fnInSourGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['sour', 'head', 'use', 'regdate'];
    let captions = ['SOUR', 'HEAD', 'USE', 'DATE'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(5);
    dataGrid.setEditing("popup", true, true, false);
    dataGrid.setEditingPopup("FN IN SOURCE", 300, 300);
    dataGrid.setEditingForm(
        ['sour', 'head', 'use'],
        1,
        2,
        "FN IN SOURCE"
    );

    dataGrid.setColumnReadOnly('sour');


    // 등록
    dataGrid.setOnEditorPreparing(function(e) {
        if (e.dataField === 'sour') {
            e.editorOptions.readOnly = true;
            e.editorOptions.value = $("#sourFnName").val();
        }
    });

    dataGrid.setOnRowInserting(function(data, deferred) {
        data.sour = $("#sourFnName").val();
        sendDbmsDataToServer("fone/sour/insert", data, deferred, sourFoneGrid, getSourFnList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("fone/sour/update", data, deferred, fnInSourGrid, getSourFnList);
    });

    dataGrid.setOnRowClick(function(e) {
        getTableList(e.data.sour);
    });

    fnInSourGrid = $('#fnInSourGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    fnInSourGrid.beginCustomLoading();

}


//  FN_IN_Sour 리스트
function getSourFnList() {

    $.ajax({
        url: "fone/allSourList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            fnInSourGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            fnInSourGrid.endCustomLoading();
        }
    });
}



//  FN_IN_TABLE 그리드 세팅
function fnInTableGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['sour', 'tnam', 'maxNo','topNo','option','cond','ordFld','isGroup','use','regdate'];
    let captions = ['SOUR', 'TNAM', 'MAX_NO', 'TOP_NO', 'OPTION', 'COND', 'ORD_FLD','IS_GROUP', 'USE', 'DATE'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(5);
    dataGrid.setEditing("popup", false, true, false);
    dataGrid.setEditingPopup("FN IN TABLE", 700, 400);
    dataGrid.setEditingForm(
        ['sour', 'tnam', 'maxNo','topNo','option','cond','ordFld','isGroup','isGroup','use'],
        2,
        2,
        "FN IN TABLEl"
    );

    dataGrid.setColumnReadOnly('sour', 'tnam');

    dataGrid.setToolbar(2, [
        ['FIELD', false, false, false, '', fieldFn],
        ['INDEX', false, false, false, '', indexFn]
    ]);

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("fone/table/update", data, deferred, fnInTableGrid, () => getTableList(data.sour));
    });

    fnInTableGrid = $('#fnInTableGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    fnInTableGrid.beginCustomLoading();

}

//  FN_IN_TABLE 리스트 가져오기
function getTableList(sour) {

    $.ajax({
        url: "fone/table",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ sour }),
        success(res) {
            fnInTableGrid.option("dataSource", res);
            fnInTableGrid.clearSelection();
            $('#sourFnName').val(sour);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            fnInTableGrid.endCustomLoading();
        }
    });
}
