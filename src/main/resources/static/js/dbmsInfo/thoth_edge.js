var selectedServiceId = null; //  SERV_ID 그리드에서 선택된 ID

// [왼쪽 그리드] SERV_ID 리스트
function getPkServIdList(serviceIdToSelect) {
    $.ajax({
        url: "thoth/servIdList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success(res) {
            pkServIdGrid.option("dataSource", res);
            pktServiceIds = res.map(item => item.serviceId); // SERV_ID에서 받아온 서비스 아이디 리스트
 
            if (serviceIdToSelect) {
                const newRowObject = res.find(item => item.serviceId == serviceIdToSelect);
                if (newRowObject) {
                    pkServIdGrid.selectRows([newRowObject], false);
                    pkServIdGrid.option("focusedRowKey", newRowObject);
                }
            }
        },
        complete(){
            pkServIdGrid.endCustomLoading();
        }
    });
}



// [왼쪽 그리드] SERV_ID
function pkServIdGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['serviceId','content','start/stop'];
    dataGrid.setColumns(columns);
    dataGrid.setPaging(15);
    dataGrid.setEditing("popup", true, true, true);
    dataGrid.setEditingTexts("PK_HNDR_SERV_ID", "이 항목을 삭제하시겠습니까?");
    dataGrid.setEditingPopup("PK_HNDR_SERV_ID", 400, 300);
    dataGrid.setEditingForm(
        ['serviceId','content'],
        1,
        2,
        "PK_HNDR_SERV_ID",
    );

    dataGrid.setValidationRules('serviceId', 'required', '서비스 아이디를 입력해주세요');
    dataGrid.setValidationRules('serviceId', 'numeric', '숫자만 입력 가능합니다.');
    dataGrid.setValidationRules('serviceId', 'range', '1부터 19999까지의 숫자만 입력 가능합니다.', { min: 1, max: 19999 });
    dataGrid.setColumnReadOnly("serviceId")

    // 등록
    dataGrid.setOnRowInserting(function(data, deferred) {
        sendDbmsDataToServer("thoth/insert", data, deferred, pkServIdGrid,
            function() {
                getPkServIdList(data.serviceId);
                getPktConfigList(data.serviceId);
                getPkgDataLoadByPkgId();
            }
        );
    });

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/update", data, deferred, pkServIdGrid, getPkServIdList);
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/delete", data, deferred, pkServIdGrid, function() {
            getPkServIdList();
            pktConfigGrid.option("dataSource", []);
            getPkgDataLoadByPkgId();
        });
    });

    dataGrid.setOnRowClick(function(e){
        pktConfigGrid.beginCustomLoading();

        selectedServiceId = e.data.serviceId
        getPktConfigList(selectedServiceId);

    });


    pkServIdGrid = $('#pkServIdGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    pkServIdGrid.beginCustomLoading();

    pkServIdGrid.option("toolbar.items", [
        {
            location: "before",
            widget: "dxButton",
            options: {
                icon: "add",
                text: "USER_SERV",
                onClick: function() {
                    openCommonUserServPopup({
                        popupContainerId: "edgeUserServPopup",
                        gridId: "userServEdgeGrid",
                        selectBoxId: "userServEdgeSelectBox",
                        initialPkgId: "PKT",
                        gridInstanceHolder: {
                            get instance() { return userServEdgeGrid; },
                            set instance(v) { userServEdgeGrid = v; }
                        }
                    });
                }
            }
        },
        "addRowButton",
    ]);

}

// [오른쪽 그리드] CONFIG 리스트
function getPktConfigList(serviceId) {

    $.ajax({
        url: "thoth/configList",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ serviceId }),
        success(res) {
            pktConfigGrid.option("dataSource", res);
        },
        complete(){
            pktConfigGrid.endCustomLoading();
        }
    });
}


// [오른쪽 그리드] CONFIG
function pktConfigGridSetting() {

    let dataGrid = new dxdatagrid();
    let columns = ['serviceId','name', 'value'];
    dataGrid.paging.enabled = false;
    dataGrid.setColumns(columns);
    dataGrid.setEditing("popup", false, true, true);
    dataGrid.setEditingPopup("PK_HNDR_PKT_CONFIG", 500, 400); // Increased height for example
    dataGrid.setEditingForm(
        ['serviceId','name', 'value'],
        1,
        2,
        "PK_HNDR_PKT_CONFIG",
    );

    dataGrid.setEditingTexts("PK_HNDR_PKT_CONFIG", "이 항목을 삭제하시겠습니까?");
    dataGrid.setColumnReadOnly("serviceId","name");

    const originalOnEditorPreparing = dataGrid.onEditorPreparing;
    dataGrid.onEditorPreparing = function(e) {
        // Call original handler first
        if (originalOnEditorPreparing) {
            originalOnEditorPreparing.apply(this, arguments);
        }

        // Only run our logic once per form, using 'value' field as a trigger
        if (e.parentType === 'dataRow' && e.dataField === 'value') {

            const name = e.row.data.name;
            const examples = {
                "IN_CONNECT": "[FF|SR|TS|TC|UP|SM|XX],[Path|Address],[Port|Speed],Notry,Timeout",
                "OT_CONNECT": "[FF|SR|TS|TC|UP|SM|XX],[Path|Address],[Port|Speed],Notry,Timeout",
                "MAX_PKT_SIZE": "[2048,4096]",
                "PACKET_TYPE": "[fixed,variable,eop,pkid]",
                "PKAN_MODE": "[trace|debug|count|number(n)|noap]",
                "PKRD_MODE": "[trace|debug|count|number(n)|noap]",
                "PKT_EOP_CONFIG": "binary(10,13)",
                "PKT_FLD_TYPE": "[static,eof]",
                "PKT_PKID_MARK": "[01,290||03,300]",
                "PKT_VAR_CONFIG": "char,20,4,10,2,01;char,80,2,30,2,xx;"
            };
            const exampleText = examples[name];
            const $form = $(e.editorElement).closest('.dx-form');
            $form.parent().find('.pkt-config-example').remove();

            if (exampleText) {
                const $exampleDiv = $('<div class="pkt-config-example" style="margin-top: 15px; clear: both;"></div>');
                const $exampleContent = $('<pre>').css({
                    padding: '10px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f9f9f9',
                    'white-space': 'pre-wrap',
                    'word-wrap': 'break-word',
                    'font-size': '12px' // smaller font for example
                }).text(exampleText);
                $exampleDiv.append('<b style="font-size: 14px;">EX)</b>').append($exampleContent);
                $form.after($exampleDiv);
            }
        }
    };

    dataGrid.toolbar = {
        items: [
            {
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'PKG_DATA_LOAD',
                    icon: 'add',
                    onClick: function () {
                        openPkgDataLoad();
                    }
                }
            },
            {
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'PK_HNDR_PKT_DEF',
                    icon: 'add',
                    onClick: function () {
                        openPkgDefPopup();
                    }
                }
            },
            {
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'PK_HNDR_PKT_ACT',
                    icon: 'add',
                    onClick: function () {
                        openPkgActPopup();
                    }
                }
            },
            {
                location: 'before',
                widget: 'dxButton',
                options: {
                    text: 'PK_HNDR_PKT_ORDER',
                    icon: 'add',
                    onClick: function () {
                        openPkgOrderPopup();
                    }
                }
            },
        ]
    };

    // 수정
    dataGrid.setOnRowUpdating(function(data, deferred) {
        sendDbmsDataToServer("thoth/configUpdate", data, deferred, pktConfigGrid, function (){
            getPktConfigList(data.serviceId);
        });
    });

    // 삭제
    dataGrid.setOnRowRemoving(function(data, deferred) {
        sendDbmsDataToServer("thoth/configDelete", data, deferred, pktConfigGrid, function (){
            getPktConfigList(data.serviceId);
        });
    });

    pktConfigGrid = $('#pktConfigGrid').dxDataGrid(dataGrid).dxDataGrid("instance");

    if (!pktConfigGrid.option("dataSource")) {
        pktConfigGrid.endCustomLoading();
    }

    pktConfigGrid.on("rowPrepared", function(e) {
        if (e.rowType === "data") {
            const $buttons = $(e.rowElement).find(".dx-command-edit"); // edit 버튼 있는 td
            if ($buttons.length) {
                const $resetBtn = $('<div class="dx-link dx-icon-refresh" title="초기화"></div>');
                $resetBtn.on("click", function() {
                    defaultValueUpdate(e.data);
                });
                $buttons.append($resetBtn); // edit/delete 버튼 옆에 추가
            }
        }
    });
}

// 초기화 버튼 : 기본값으로 변경
function defaultValueUpdate(data){
    $.ajax({
        url: "thoth/defaultUpdate",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (res) => {
            getPktConfigList(res.serviceId);
        },
        error: (err) => {
            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            pktConfigGrid.endCustomLoading();
        }
    });
}


// 시스템 시작
function systemStart(data, callback){

    $.ajax({
        url: "thoth/edge/start",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(data),
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

// 시스템 시작
function systemStop(data, callback){

    $.ajax({
        url: "thoth/edge/stop",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(data),
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

