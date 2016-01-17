String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

String.prototype.contain = function (find) {
	return this.indexOf(find) > -1;
}

var frequency_list = [];
var tags = ['\/ORG', '\/O', '\/GPE', '\/PERSON', '\/MISC', '\/LOC', '\/T'];
var punc = [',', '，', '.', '。', '!', '?', '？', '！', ':', '：', 
			'\'', '’', '\"', '”', '“', '<', '《', '》', '>', '、',
			'/', ';', '；', '[', ']', '{', '}', '\\', '|', '【', '】',
			'·', '`', '(', ')', '（', '）', '~', '%'];
var link_button = 	"<button type='button' class='btn btn-link btn-circle' " + 
						"onClick=\"window.open('__LINK__', '_blank')\">" +
						"<i class='glyphicon glyphicon-link'></i></button>";
var fontSize;
var ran = Math.random() * 3;
var fill = d3.scale.category20b();
if (ran > 2) fill = d3.scale.category20c();
else if (ran > 1) fill = d3.scale.category20();

$(document).ready(function() {
	$("#empty-notification").hide();
	$("#step1-notification").hide();
	$("#step2-notification").hide();
	$("#step3-notification").hide();
	$("#step4-notification").hide();
	$("#end_notification").hide();

	var cloud = wordCloud("#news_wordcloud");

	$("#submit-text").click(function() {
		var content = $("#text").val().trim();
		if (content.length == 0) {
			$("#empty-notification").show();
			return;
		}
		$("#step1-notification").show();
		$("#submit-text").attr("disabled", true);
		$("#text").attr("readOnly", true);
		$.ajax({
			url: '/api/online_process',
			contentType: "application/json; charset=utf-8",
			dataType: "text",
			data: {
				data: content
			}
		}).done(function (response) {
			$("#step1-notification").hide();
			$("#step2-notification").show();
			response = JSON.parse(response);
			content = response['content'];
			content = content.replaceAll("\\", "")
								.replaceAll("``", "“")
								.replaceAll("\"", "”")
								.replaceAll("-LRB-", "(")
								.replaceAll("-RRB-", ")");
			var freq = {};
			var word_set = [];
			var frequency_list = [];
			var max_size = 1;
			var fix = content;
			fix = fix.split(/\n| /);
			for (word of fix) {
				for (tag of tags) {
					word = word.replaceAll(tag, "");
				}
				if (word.contain("\/url=")) {
					word = word.replace(/\/url=.*/, "");
				}
				word = word.trim();

				if ($.inArray(word, punc) != -1) continue;
				if (word.length == 1) continue;
				if (isNaN(word) == false) continue;
				if (freq[word]) {
					freq[word]++;
					if (freq[word] > max_size) {
						max_size = freq[word];
					}
				} else {
					freq[word] = 1;
					word_set.push(word);
				}
			}
			frequency_list = word_set.map(function (d) {
				return {key: d, value: 80 * freq[d] / max_size};
			});
			cloud.update(frequency_list);

			$("#step2-notification").hide();
			$("#step3-notification").show();
			postag = response['postag'];
			console.log(postag);
			var word_pos = "";
			for (str of postag) {
				var word_str = str.split(" ")[0].trim();
				var word_tag = 'word_' + str.split(" ")[1];
				word_pos += "<dd class='word_width " + word_tag + "'>" + word_str + "</dd>";
			}
			$("#news_word_seg").html(word_pos);

			$("#step3-notification").hide();
			$("#step4-notification").show();
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
				word_seg += "<dd class='word_width " + word_class + "'>" + word + "</dd>"+ word_link;
			}
			$("#news_word_link").html(word_seg);

			$("#step4-notification").hide();
			$("#end_notification").show();
			$("#submit-text").attr("disabled", false);
			$("#text").attr("readOnly", false);
		});
	});
});

function wordCloud(selector) {
	var w = $(selector).width();
	if (w > 900) w = 900;
	var h = $(selector).height();
	var svg = d3.select(selector).append("svg")
				.attr("width", w)
				.attr("height", h)
				.append("g")
				.attr("transform", "translate(" + [w >> 1, h >> 1] + ")");
	
	function draw(words) {
		var cloud = svg.selectAll("g text")
						.data(words, function(d) { return d.key; });
		cloud.enter()
			.append("text")
			.style("font-family", "Impact")
			.style("fill", function(d, i) { return fill(i); })
			.attr("text-anchor", "middle")
			.attr('font-size', 1)
			.text(function(d) { return d.key; });

        cloud.transition()
			.duration(600)
			.style("font-size", function(d) { return d.size + "px"; })
			.attr("transform", function(d) {
				return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			})
			.style("fill-opacity", 1);

		cloud.exit()
			.transition()
			.duration(200)
			.style('fill-opacity', 1e-6)
			.attr('font-size', 1)
			.remove();
	}

	return {
		update: function(words) {
			var w = $(selector).width();
			if (w > 900) w = 900;
			var h = $(selector).height();
			d3.layout.cloud().size([w, h])
				.words(words)
				.padding(5)
				.rotate(function() { return ~~(Math.random() * 2) * 90; })
				.font("Impact")
				.fontSize(function(d) { return d.value; })
				.on("end", draw)
				.start();
		}
	}
};