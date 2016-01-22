var category = [
	"hot", "finance", "military", "society", "tech",
	"sports", "education", "entertainment", "law", "travel",
	"china", "internation", "gangao", "other"
];
var cate_mapping = {
	"hot": "热点",
	"finance": "财经",
	"military": "军事",
	"society": "社会",
	"tech": "科技",
	"sports": "体育",
	"education": "教育",
	"entertainment": "娱乐",
	"law": "法律",
	"travel": "旅游",
	"china": "国内",
	"internation": "国际",
	"gangao": "港澳台",
	"other": "其他"
};
var source = [
	"腾讯网", "网易", "中国新闻网", "凤凰网", "人民网", "新华网", "新浪网"
];
var source_mapping = {
	"qq": "腾讯网",
	"163": "网易",
	"chnews": "中国新闻网",
	"ifeng": "凤凰网",
	"people": "人民网",
	"xinhua": "新华网",
	"sina": "新浪网"
};
var title_text = "<div class='col-md-12'>" + 
				"<h3 style='margin-bottom: 12px;'>__TITLE__</h3></div>";
var source_text = "<div class='col-md-2' style='color: grey'><i class='fa fa-rss-square fa-fw'></i> __SOURCE__</div>";
var time_text = "<div class='col-md-3' style='color: grey'><i class='fa fa-clock-o fa-fw'></i> __TIME__ </div>";
var cate_text = "<div class='col-md-1'><span class='label label-warning'>__CATE__</span></div>";
var link_button = 	"<div class='col-md-1'><button type='button' class='btn btn-success btn-circle' " + 
						"onClick=\"window.open('__LINK__', '_blank')\">" +
						"<i class='fa fa-link'></i></button></div>";
var news_info_button = "<div class='col-md-2'><button type='button' class='btn btn-info btn-xs btn-outline' " + 
						"onClick=\"window.open('news_page?outer_id=__NEWSID__', '_blank')\">" +
						"处理结果 <i class='fa fa-hand-o-right'></i></div>";

var url = window.location.href;
var temp = url.split("cate=");
var cate = null;
if (temp.length > 1) {
	cate = cate_mapping[temp[1]];
}
var source = null;
temp = url.split("source=");
if (temp.length > 1) {
	source = source_mapping[temp[1]];
}

$(document).ready(function() {
	if (source) {
		$("#category").text(source + "新闻");
	} else {
		$("#category").text(cate + "新闻");
	}
	var table = $("#dataTables").DataTable({
		"responsive": true,
		"bProcessing": true,
		"bAutoWidth": false,
		"bSort" : false,
		"aLengthMenu": [[10, 20], [10, 20]],
		"aoColumns": [{bSortable: false}],
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
	/*
	var table = $("#dataTables").DataTable({
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
	*/
	if (cate) {
		$.ajax({
			type: "GET",
			url: "/api/get_lastest_news_by_cate",
			contentType: "application/json; charset=utf-8",
			dataType: "text",
			data: {
				cate: cate
			}
		}).done(function(response) {
			response = JSON.parse(response);
			for (news of response) {
				var link = link_button.replace("__LINK__", news['URL']);
				var news_info = news_info_button.replace("__NEWSID__", news['outer_id']);
				var title = title_text.replace("__TITLE__", news['title']);
				var cate = cate_text.replace("__CATE__", news['cate']);
				var source = source_text.replace("__SOURCE__", news['source']);
				var time = time_text.replace("__TIME__", news['pubtime']);
				var innerHTML = title + source + time + cate + link + news_info;
				table.row.add([innerHTML]);
			}
			table.draw();
		});
	} else {
		$.ajax({
			type: "GET",
			url: "/api/get_lastest_news_by_source",
			contentType: "application/json; charset=utf-8",
			dataType: "text",
			data: {
				source: source
			}
		}).done(function(response) {
			response = JSON.parse(response);
			for (news of response) {
				var link = link_button.replace("__LINK__", news['URL']);
				var news_info = news_info_button.replace("__NEWSID__", news['outer_id']);
				var title = title_text.replace("__TITLE__", news['title']);
				var cate = cate_text.replace("__CATE__", news['cate']);
				var source = source_text.replace("__SOURCE__", news['source']);
				var time = time_text.replace("__TIME__", news['pubtime']);
				var innerHTML = title + source + time + cate + link + news_info;
				table.row.add([innerHTML]);
			}
			table.draw();
		});
	}
});