var url = window.location.href;
var outer_id = url.split('=')[1];
var tags = ['\/ORG', '\/O', '\/GPE', '\/PERSON', '\/MISC', '\/LOC', '\/T'];
var punc = [',', '，', '.', '。', '!', '?', '？', '！', ':', '：', 
			'\'', '’', '\"', '”', '“', '<', '《', '》', '>', '、',
			'/', ';', '；', '[', ']', '{', '}', '\\', '|', '【', '】',
			'·', '`', '(', ')', '（', '）', '~', '%'];
var freq = {};
var word_set = [];
var frequency_list = [];
var max_size = 1;
var ran = Math.random() * 3;
var fill = d3.scale.category20b();
if (ran > 2) fill = d3.scale.category20c();
else if (ran > 1) fill = d3.scale.category20();

String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

String.prototype.contain = function (find) {
	return this.indexOf(find) > -1;
}

var w = window.innerWidth,
    h = window.innerHeight;

var fontSize;

var layout = d3.layout.cloud()
        .timeInterval(Infinity)
        .size([w, h])
        .fontSize(function(d) {
            return fontSize(+d.value);
        })
        .text(function(d) {
            return d.key;
        })
        .rotate(function() {return ~~(Math.random() * 2) * 90; })
        .on("end", draw);

var svg = d3.select("#vis").append("svg")
        .attr("width", w)
        .attr("height", h);

var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

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
		response.content_with_url = response.content_with_url.replaceAll("\\", "")
															.replaceAll("``", "“")
															.replaceAll("\"", "”")
															.replaceAll("-LRB-", "(")
															.replaceAll("-RRB-", ")");
		var fix = response.content_with_url;
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
				freq[word] ++;
				if (freq[word] > max_size) {
					max_size = freq[word];
				}
			} else {
				freq[word] = 1;
				word_set.push(word);
			}
		}
		frequency_list = word_set.map(function (d) {
			return {key: d, value: freq[d]};
		});
		update();
	});
});

window.onresize = function(event) {
    update();
};

function draw(data, bounds) {
    var w = window.innerWidth,
        h = window.innerHeight;

    svg.attr("width", w).attr("height", h);

    scale = bounds ? Math.min(
            w / Math.abs(bounds[1].x - w / 2),
            w / Math.abs(bounds[0].x - w / 2),
            h / Math.abs(bounds[1].y - h / 2),
            h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

    var text = vis.selectAll("text")
            .data(data, function(d) {
                return d.text.toLowerCase();
            });
    text.transition()
            .duration(1000)
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function(d) {
                return d.size + "px";
            });
    text.enter().append("text")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function(d) {
                return d.size + "px";
            })
            .style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);
    text.style("font-family", function(d) {
        return d.font;
            })
            .style("fill", function(d) {
                return fill(d.text.toLowerCase());
            })
            .text(function(d) {
                return d.text;
            });

    vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
}

function update() {
    layout.font('impact').spiral('archimedean');
    fontSize = d3.scale['sqrt']().range([10, 100]);
    fontSize.domain([1, max_size]);
    layout.stop().words(frequency_list).start();
}