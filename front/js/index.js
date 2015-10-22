var category = [
	"hot", "finance", "military", "society", "tech",
	"sports", "education", "entertainment", "law", "travel",
	"china", "internation", "gangao", "other"
];
var tables = [];
var link_button = 	"<button type='button' class='btn btn-link btn-circle' " + 
						"onClick=\"window.open('__LINK__', '_blank')\">" +
						"<i class='fa fa-link'></i></button>";
var news_info_button = "<button type='button' class='btn btn-primary btn-xs btn-outline' " + 
						"onClick=\"window.open('news_page?outer_id=__NEWSID__', '_blank')\">" +
						"处理结果 <i class='fa fa-hand-o-right'></i>";

$(document).ready(function() {
	for (cate of category) {
		table_div = '#dataTables_' + cate;
		var table = $(table_div).DataTable({
			"responsive": true,
			"bProcessing": true,
			"bAutoWidth": false,
			"aaSorting": [[
				1, "desc"
			]],
			"aoColumns": [
				{"sTitle": "标题", "sWidth": "50%"},
				{"sTitle": "发布时间", "sWidth": "20%"},
				{"sTitle": "新闻来源", "sWidth": "15%", "bSortable": false},
				{"sTitle": "", "bSortable": false}
			],
			"aLengthMenu": [[10, 20], [10, 20]],
			"oLanguage": {
				"oPaginate": {
					"sNext": "<i class='fa fa-fw fa-arrow-right'></i>",
					"sPrevious": "<i class='fa fa-fw fa-arrow-left'></i>"
				},
				"sLoadingRecords": "<i class='fa fa-lg fa-spinner'></i>",
				"sSearch": "<i class='glyphicon glyphicon-search'></i>",
				"sInfo": "_START_ ~ _END_（共 _TOTAL_ 条）",
				"sLengthMenu": "每页显示 _MENU_ 条"
			}
		});
		tables.push(table);
	}
	$.ajax({
		type: "GET",
		url: "/api/get_lastest_news",
		contentType: "application/json; charset=utf-8",
		dataType: "text"
	}).done(function(response) {
		response = JSON.parse(response);
		for (idx in category) {
			cate = category[idx];
			table = tables[idx];
			news_list = response[cate];
			for (news of news_list) {
				var link = link_button.replace("__LINK__", news['URL']);
				var news_info = news_info_button.replace("__NEWSID__", news['outer_id']);
				table.row.add([
					news['title'],
					news['pubtime'],
					news['source'] + " " + link,
					news_info
				]);
			}
			table.draw();
		}
	});
});