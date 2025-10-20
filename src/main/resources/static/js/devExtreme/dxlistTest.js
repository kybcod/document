let dxlistdata = null;
let list_data = [
	{
		id: 1,
		text: "1번메뉴"
	},{
		id: 2,
		text: "2번메뉴"
	},{
		id: 3,
		text: "3번메뉴"
	},{
		id: 4,
		text: "4번메뉴"
	},{
		id: 5,
		text: "5번메뉴"
	},{
		id: 6,
		text: "6번메뉴"
	},{
		id: 7,
		text: "7번메뉴"
	},{
		id: 8,
		text: "8번메뉴"
	}
];
$(document).ready(function(){
	test_list_start();
})
function test_list_start(){
	let dx_list = new dxlist();
	dx_list.setKey("id");
	dx_list.setField("text");
	dx_list.setSelect(true, "all", "전체선택");
	dx_list.setDataSource(list_data);
	
	
	dx_list.setOnSelectionChanged(function(){
	})
	
	dxlistdata = $('#inip_sub').dxList(dx_list).dxList("instance");
}
function test_btn_click(){
}

/*

<div class="table_wrap">
	<div class="table_container" id="treeview"></div>
	<button onclick="test_btn_click()">버튼</button>
</div>

*/