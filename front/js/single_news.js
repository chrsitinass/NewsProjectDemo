var url = window.location.href;
var outer_id = url.split('=')[1];
var tags = ['\/ORG', '\/O', '\/GPE', '\/PERSON', '\/MISC', '\/LOC', '\/T'];
var punc = [',', '，', '.', '。', '!', '?', '？', '！', ':', '：', 
			'\'', '’', '\"', '”', '“', '<', '《', '》', '>', '、',
			'/', ';', '；', '[', ']', '{', '}', '\\', '|', '【', '】',
			'·', '`', '(', ')', '（', '）', '~', '%'];
var link_button = 	"<button type='button' class='btn btn-link btn-circle' " + 
						"onClick=\"window.open('__LINK__', '_blank')\">" +
						"<i class='glyphicon glyphicon-link'></i></button>";

String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

String.prototype.contain = function (find) {
	return this.indexOf(find) > -1;
}

$(document).ready(function() {
	$.ajax({
		url: "/api/get_single_news",
		type: "GET",
		contentType: "application/json; charset=utf-8",
		dataType: "text",
		data: {
			outer_id: outer_id
		},
		async: false
	}).done(function(response) {
		response = JSON.parse(response);
		$("#news_title").text(response.title);
		$("#news_source").text("来源: " + response.source);
		$("#news_pubtime").text("发布日期: " + response.pubtime);
		$("#news_cate").text(response.cate);
		$("#news_category").text(response.category);
		response.content = response.content.replaceAll("\\", "");
		
		response.content_with_url = response.content_with_url.replaceAll("\\", "")
															.replaceAll("``", "“")
															.replaceAll("\"", "”")
															.replaceAll("-LRB-", "(")
															.replaceAll("-RRB-", ")");
		var content = response.content.split("\n");
		// console.log(content);
		var cont = document.getElementById("news_content");
		cont.innerHTML = "";
		var blank = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		for (para of content) {
			// console.log(para);
			cont.innerHTML += "<p>" + blank + para + "</p>";
		}
		// $("#news_content").text(response.content);
		var fix = response.content_with_url;
		fix = fix.split(/\n| /);
		var word_seg = "";
		for (word of fix) {
			var word_class = "";
			var word_link = "";
			if (word.contain("\/url=")) {
				word_link = word.substring(word.indexOf("http"), word.length - 1);
				word = word.replace(/\/url=.*/, "");
				word_link = link_button.replace("__LINK__", word_link);
			}
			var word_class = "";
			if (word.contain('ORG')) {
				word_class += " word_org";
			} else if (word.contain('PERSON')) {
				word_class += " word_per";
			} else if (word.contain('GPE')) {
				word_class += " word_gpe";
			} else if (word.contain('MISC')) {
				word_class += " word_misc";
			} else if (word.contain('LOC')) {
				word_class += " word_loc";
			} else if (word.contain('T')) {
				word_class += " word_temp";
			} else {
				word_class += " word_none";
			}
			for (tag of tags) {
				word = word.replaceAll(tag, "");
			}
			word = word.trim();
			word_seg += "<dd class='word_width" + word_class + "'>" + word + "</dd>"+ word_link;
		}
		$("#news_word_seg").html(word_seg);
	});
});