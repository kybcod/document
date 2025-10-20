
function openSourRegi(data) {
    loadContent("dbms_info/fone_source_regi", null, "tab-fone-source-regi", "SOUR_REGI");

    // tab-fone-source-regi 가 로드되면 후처리 실행
    $(document).one("tabLoaded", function (e, tabId) {
        if (tabId === "tab-fone-source-regi") {
            sourGridSetting();
            getSourList();
            tableFoneGridSetting();
            getTableFoneList(data);
            fieldGridSetting();
            indexGridSetting();
        }
    });
}


// 필드 그리드 세팅
function sourGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['sour', 'head', 'use', 'regdate'];
    let captions = ['SOUR', 'HEAD', 'USE', 'DATE'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(5);
    dataGrid.setEditing("popup", true, false, false);   // 추가, 수정, 삭제 모두 가능
    dataGrid.setEditingPopup("FN IN SOURCE", 300, 300);
    dataGrid.setEditingForm(
        ['sour', 'head', 'use'],
        1,
        2,
        "FN IN SOURCE"
    );

    dataGrid.setOnEditorPreparing(function(e) {
        if (e.dataField === 'sour') {
            e.editorOptions.readOnly = true;
            e.editorOptions.value = $("#sourName").val();
        }
    });

    dataGrid.setOnRowClick(function(e) {
        console.log("dddd", e.data);
        getTableFoneList(e.data.sour);
    });

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        data.sour = $("#sourName").val();
        sendDbmsDataToServer("fone/sour/insert", data, deferred, sourFoneGrid, getSourList);
    });

    sourFoneGrid = $('#sourFoneGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    sourFoneGrid.beginCustomLoading();
}

// 소스 리스트
function getSourList() {

    $.ajax({
        url: "fone/sourList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            sourFoneGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            sourFoneGrid.endCustomLoading();
        }
    });
}


// table 그리드 세팅
function tableFoneGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['tnam'];
    let captions = ['TNAM'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(5);
    dataGrid.setToolbar(2, [
        ['FIELD', false, false, false, '', fieldGridFn],
        ['INDEX', false, false, false, '', indexGridFn]
    ]);
    tableFoneGrid = $('#tableFoneGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    tableFoneGrid.beginCustomLoading();

}


// 테이블 데이터 받아오기
function getTableFoneList(data) {

    let selectedData = data.name || data;

    $.ajax({
        url: "snet/table",
        type: "POST",
        contentType: "application/json",
        data : JSON.stringify({sour : selectedData}),
        dataType: "json",
        success(res) {
            $("#sourName").val(selectedData);
            tableFoneGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            tableFoneGrid.endCustomLoading();
        }
    });
}




// 필드 그리드
function fieldGridFn() {

    if (!tableFoneGrid.getSelectedRowsData()[0]){
        basicAlert({ icon: 'error', text: "테이블을 선택해 주세요." });
        return;
    }

    fieldGridSetting();
    getFieldFoneList()
    $("#fieldIndexText").text("FIELD");
}


// 인덱스 그리드
function indexGridFn() {

    if (!tableFoneGrid.getSelectedRowsData()[0]){
        basicAlert({ icon: 'error', text: "테이블을 선택해 주세요." });
        return;
    }

    indexGridSetting();
    getIndexFoneList()
    $("#fieldIndexText").text("INDEX");
}


let seqFieCnt = 1;

// 필드 그리드 세팅
function fieldGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['seq', 'fnam', 'attr', 'use', 'select'];
    let captions = ['SEQ', 'FNAM', 'ATTR', 'USE', 'SELECT'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.paging.enabled = false;
    dataGrid.setEditing("row", true, false, false);

    fieldIndexFoneGrid = $('#fieldIndexFoneGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    fieldIndexFoneGrid.beginCustomLoading();

    fieldIndexFoneGrid.option("toolbar.items", [
        "addRowButton",
        {
            location: "after",
            widget: "dxButton",
            options: {
                text: "저장",
                icon: "save",
                onClick: function() {
                    fieldSave();
                }
            }
        }
    ]);

    // 새 행 추가 시 seq 자동 부여
    fieldIndexFoneGrid.option("onInitNewRow", function(e) {
        e.data.seq = seqFieCnt; // ++ 하지 않고 현재 값만 할당
    });

    fieldIndexFoneGrid.option("onRowInserted", function(e) {
        seqFieCnt++;
    });

}


// 필드 리스트
function getFieldFoneList() {

    let tableData = tableFoneGrid.getSelectedRowsData()[0];
    let selectSour = $('#sourName').val();

    $.ajax({
        url: "snet/field",
        type: "POST",
        contentType: "application/json",
        data : JSON.stringify({
            tnam : tableData.tnam,
            sour : selectSour,
        }),
        dataType: "json",
        success(res) {
            res.forEach((row, i) => {
                row.seq = i + 1;
            });

            // 마지막 번호 + 1부터 다음 추가 시작
            seqFieCnt = res.length + 1;

            fieldIndexFoneGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            fieldIndexFoneGrid.endCustomLoading();
        }
    });
}

let seqIdxCnt = 0;


// 인덱스 그리드 세팅
function indexGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['seq', 'inam', 'isUniq','fnams', 'use', 'select'];
    let captions = ['SEQ', 'INAM', 'UNIQ', 'FNAMS', 'USE', 'SELECT'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.paging.enabled = false;
    dataGrid.setEditing("row", true, false, false);

    fieldIndexFoneGrid = $('#fieldIndexFoneGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    fieldIndexFoneGrid.beginCustomLoading();

    fieldIndexFoneGrid.option("toolbar.items", [
        "addRowButton",
        {
            location: "after",
            widget: "dxButton",
            options: {
                text: "저장",
                icon: "save",
                onClick: function() {
                    indexSave();
                }
            }
        }
    ]);


    // 새 행 추가 시 seq 자동 부여
    fieldIndexFoneGrid.option("onInitNewRow", function(e) {
        e.data.seq = seqIdxCnt; // ++ 하지 않고 현재 값만 할당
    });

    fieldIndexFoneGrid.option("onRowInserted", function(e) {
        seqIdxCnt++;
    });


}

// 인덱스 리스트
function getIndexFoneList() {

    let tableData = tableFoneGrid.getSelectedRowsData()[0];
    let selectSour = $('#sourName').val();

    $.ajax({
        url: "snet/index",
        type: "POST",
        contentType: "application/json",
        data : JSON.stringify({
            tnam : tableData.tnam,
            sour : selectSour,
        }),
        dataType: "json",
        success(res) {
            res.forEach((row, i) => {
                row.seq = i;
            });

            // 마지막 번호 + 1부터 다음 추가 시작
            seqIdxCnt = res.length;


            fieldIndexFoneGrid.option("dataSource", res);
        },
        error(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            fieldIndexFoneGrid.endCustomLoading();
        }
    });
}

// FN_IN_INDEX 저장
function indexSave() {

    let allData = fieldIndexFoneGrid.getDataSource().items();
    let selected = tableFoneGrid.getSelectedRowsData()[0];
    let filteredData = allData
        .filter(row => row.select === 'Y')
        .map(row => {
            return {
                ...row,
                tnam: selected.tnam,
                sour : $('#sourName').val(),
                isUniq : row.isUniq === "NON_UNIQUE" ? '0' : '1',
            };
        });


    // 저장
    $.ajax({
        url: 'fone/index/insert',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(filteredData),
        success: function(response) {
            basicAlert({ icon: 'success', text: "인덱스 저장이 완료되었습니다." });
            getIndexFoneList();
            $('.custom-header-checkbox').dxCheckBox('instance').option('value', false);
        },
        error: function(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        }
    });


}


// FN_IN_FIELD 저장
function fieldSave() {

    let allData = fieldIndexFoneGrid.getDataSource().items();
    let selected = tableFoneGrid.getSelectedRowsData()[0];
    let filteredData = allData
        .filter(row => row.select === 'Y')
        .map(row => {
            return {
                ...row,
                tnam: selected.tnam,
                sour : $('#sourName').val(),
            };
        });

    // 저장
    $.ajax({
        url: 'fone/field/insert',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(filteredData),
        success: function(response) {
            basicAlert({ icon: 'success', text: "필드 저장이 완료되었습니다." });
            getFieldFoneList();
            $('.custom-header-checkbox').dxCheckBox('instance').option('value', false);
        },
        error: function(err) {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        }
    });

}