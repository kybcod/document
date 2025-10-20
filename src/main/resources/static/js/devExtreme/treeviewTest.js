let view = null;
let treeview_data = [
	{
		id: 1,
		parent: 0,
		text: "1번메뉴"
	},{
		id: 2,
		parent: 0,
		text: "2번메뉴"
	},{
		id: 3,
		parent: 0,
		text: "3번메뉴"
	},{
		id: 11,
		parent: 1,
		text: "1번안 1번메뉴"
	},{
		id: 12,
		parent: 1,
		text: "1번안 2번메뉴"
	},{
		id: 13,
		parent: 1,
		text: "1번안 3번메뉴"
	},{
		id: 111,
		parent: 11,
		text: "11번안 1번메뉴"
	},{
		id: 112,
		parent: 11,
		text: "11번안 2번메뉴"
	}
];
$(document).ready(function(){
	test_treeview_start();
})
function test_treeview_start(){
	let treeView = new dxtreeview();
	treeView.setId("id","parent",0);
	treeView.setField("text");
	treeView.setSelectionMode("single");
	treeView.setDataSource(treeview_data);
	
	treeView.setOnSelectionChanged(function(e){
		if(view.getSelectedNodes().length != 0){
			if(view.getSelectedNodes()[0].children.length != 0){
				view.unselectItem(view.getSelectedNodeKeys()[0]);
			}
		}
	});
	
	view = $('#ivr_sub').dxTreeView(treeView).dxTreeView("instance");
}
function test_btn_click(){
}
