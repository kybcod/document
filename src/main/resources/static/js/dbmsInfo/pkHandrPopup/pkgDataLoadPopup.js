// PKG_DATA_LOAD 팝업 열기
function openPkgDataLoad() {
    $("#edgePkgDataLoadPopup").dxPopup({
        visible: true,
        showTitle: true,
        title: "PKG_DATA_LOAD",
        width: 1000,
        height: 700,
        contentTemplate: function(container) {
            container.empty();

            const selectBoxContainer = $("<div>").css({ marginBottom: "10px" }).appendTo(container);

            // SelectBox의 데이터 소스는 전체 pkgLoadIds를 사용합니다.
            const selectBoxData = [{ text: "전체", value: "" }, ...pkgLoadIds.map(id => ({ text: id, value: id }))];

            // 초기 선택값만 찾습니다.
            let initialValue = "";
            if (selectedServiceId) {
                const regex = new RegExp(`[_\.]${selectedServiceId}(?!\d)`);
                const foundId = pkgLoadIds.find(id => regex.test(id));
                initialValue = foundId || ""; // 찾은 ID가 있으면 사용하고, 없으면 '전체'를 기본값으로 합니다.
            }

            $("<div>")
                .attr("id", "pkgDataLoadSelectBox")
                .appendTo(selectBoxContainer)
                .dxSelectBox({
                    dataSource: selectBoxData, // 전체 데이터를 데이터 소스로 설정
                    displayExpr: "text",
                    valueExpr: "value",
                    value : initialValue, // 찾아낸 첫 번째 항목을 기본값으로 설정
                    placeholder: "PKG ID를 선택하세요",
                    width: 300,
                    onValueChanged: function(e) {
                        const selectPkgId = (e.value === undefined || e.value === null || e.value === "") ? "" : e.value;
                        pkgDataLoadList(selectPkgId);
                    }
                });

            // 팝업 열릴 때 찾아낸 초기값 기준으로 1회 호출
            pkgDataLoadList(initialValue);

            // 그리드 삽입
            $("<div>")
                .attr("id", "pkgDataLoadGrid")
                .appendTo(container);

            pkgDataLoadGridSetting();
        },
    });
}

// PKG_DATA_LOAD pkg_id 받아오기
function getPkgDataLoadByPkgId(){
    $.ajax({
        url: "thoth/pkgIdList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            const unsortedIds = res.map(item => item.upkgId);

            // 커스텀 정렬 로직
            unsortedIds.sort((a, b) => {
                // 비교를 위해 앞의 '~' 문자를 제거한 문자열을 생성합니다.
                const normA = a.startsWith('~') ? a.substring(1) : a;
                const normB = b.startsWith('~') ? b.substring(1) : b;

                // '~'를 제외한 문자열을 기준으로 먼저 정렬합니다.
                const comparison = normA.localeCompare(normB);
                if (comparison !== 0) {
                    return comparison;
                }

                // 위 결과가 같으면 (예: 'PKT.pkrd_88'과 '~PKT.pkrd_88'),
                // 원본 문자열을 기준으로 정렬하여 '~'가 없는 것을 앞에 오게 합니다.
                return a.localeCompare(b);
            });

            pkgLoadIds = unsortedIds;
        },
    });
}

// PKG_DATA_LOAD 팝업 안 그리드
function pkgDataLoadGridSetting(){
    let dataGrid = new dxdatagrid();
    let columns = ['upkgId', 'tabName', 'use', 'sql'];
    let captions = ['Pkg_Id', 'Tab_Name', 'Use', 'Sql'];
    dataGrid.setColumns(columns);
    dataGrid.setCaptions(captions);
    dataGrid.setPaging(10);
    dataGrid.setEditing("row", false, true, false);
    dataGrid.setColumnReadOnly('upkgId', 'tabName');

    const refreshGrid = (upkgId) => pkgDataLoadList(upkgId);

    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/pkgData/update", data, deferred, pkgDataLoadGrid, () => refreshGrid(data.upkgId));
    });

    pkgDataLoadGrid = $('#pkgDataLoadGrid').dxDataGrid(dataGrid).dxDataGrid("instance");
}

// PKG_DATA_LOAD 팝업 안 그리드 리스트 받아오기
function pkgDataLoadList(upkgId){
    $.ajax({
        url: "thoth/pkgLoadList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ upkgId }),
        success(res) {
            pkgDataLoadGrid.option("dataSource", res);
        },
        complete() {
            pkgDataLoadGrid.endCustomLoading();
        }
    });
}