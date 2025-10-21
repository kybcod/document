
// TB_DOCUMENT 리스트
function getDocList() {
    $.ajax({
        url: "doc/list",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            docTransferGrid.option("dataSource", res);
        },
        complete(){
            docTransferGrid.endCustomLoading();
        }
    });
}

// DOC_TRANS 그리드 세팅
function docTransGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['docDt','docName', 'docStatus', 'look', 'transDt', 'crtId', 'orgFilename', 'saveFilename', 'docFilepath'];
    let captions = ['등록날짜','문서명', '변환상태', '보기', '변환작업일시', '등록자ID', '원본파일명', '저장파일명', '저장경로'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", false, false, true);
    dataGrid.setEditingTexts("문서 관리", "이 항목을 삭제하시겠습니까?");


    /*// 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDataToServer("doc",'POST', data, deferred, docTransferGrid, getUserInfoList);
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDataToServer("doc", 'PUT',data, deferred, docTransferGrid, getUserInfoList);
    });*/

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDataToServer("doc", 'DELETE',data, deferred, docTransferGrid, getUserInfoList);
    });

    dataGrid.setOnCellClick(function(e, deferred) {

    });

    docTransferGrid = $('#docTransferGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    docTransferGrid.beginCustomLoading();

}
