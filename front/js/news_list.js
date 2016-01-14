var link_button = 	"<button type='button' class='btn btn-link btn-circle' " + 
						"onClick=\"window.open('__LINK__', '_blank')\">" +
						"<i class='fa fa-link'></i></button>";
var news_info_button = "<button type='button' class='btn btn-primary btn-xs btn-outline' " + 
						"onClick=\"window.open('news_page?outer_id=__NEWSID__', '_blank')\">" +
						"处理结果 <i class='fa fa-hand-o-right'></i>";

String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

$(document).ready(function() {
	$.ajax({
		url: "/api/get_news_by_filter",
		type: "GET",
		contentType: "application/json; charset=utf-8",
		dataType: "text",
		async: false
	}).done(function(response) {
		response = JSON.parse(response);
		data = [];
		for (r of response) {
			var link = link_button.replace("__LINK__", r['URL']);
			var news_info = news_info_button.replace("__NEWSID__", r['outer_id']);
			row = [r['title'].replaceAll("\\", ""), r['pubtime'], r['source'] + " " + link, news_info];
			data.push(row);
		}
		$("#news_list").dataTable({
			"responsive": true,
			"bProcessing": true,
			"bAutoWidth": false,
			"deferRender": true,
			"searching": false,
			"paging": true,
			"aaSorting": [[
				1, "desc"
			]],
			"aoColumns": [
				{"sTitle": "标题", "sWidth": "50%"},
				{"sTitle": "发布时间", "sWidth": "20%"},
				{"sTitle": "新闻来源", "sWidth": "15%", "bSortable": false},
				{"sTitle": "", "bSortable": false}
			],
			"aLengthMenu": [[10, 25, 50, 100, 200], [10, 25, 50, 100, 200]],
			"oLanguage": {
				"oPaginate": {
					"sNext": "<i class='fa fa-fw fa-arrow-right'></i>",
					"sPrevious": "<i class='fa fa-fw fa-arrow-left'></i>"
				},
				"sLoadingRecords": "<i class='fa fa-lg fa-spinner'></i>",
				"sSearch": "<i class='glyphicon glyphicon-search'></i>",
				"sInfo": "_START_ ~ _END_（共 _TOTAL_ 条）",
				"sLengthMenu": "每页显示 _MENU_ 条"
			},
			"data": data
		});
	});
});