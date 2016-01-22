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

var freq = {};
var word_set = [];
var frequency_list = [];
var max_size = 1;
var entity_set = [];
var entity_name_set = [];
var expand_in_graph = {};

var font_mapping = {
	'ORG': ['User Groups-48', 'Organization-48', 'Parent Guardian-48'],
	'PER': ['Administrator-48', 'Businessman-48', 'Collaborator-48', 'Guest-48', 'User Male-48', 'Manager-48'],
	'GPE': ['Geo-fence-48', 'Geo-fence-50', 'Map Marker-48', 'World Map-48'],
	'LOC': ['Worldwide Location-48', 'Define Location-48', 'Map Pin-48'],
	'entity': ['User Location-48', 'Mind Map-48'],
	'string': ['Informatics-48', 'Info-48', 'Info Popup-48', 'Informatics-48'],
};

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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
		document.getElementById("news_title").innerHTML = response.title.replaceAll("\\", "");
		$("#news_source").text("来源: " + response.source);
		$("#news_pubtime").text("发布日期: " + response.pubtime);
		$("#news_cate").text(response.cate);
		$("#news_category").text(response.category.replaceAll("\\", ""));
		response.content = response.content.replaceAll("\\", "");
		
		response.content_with_url = response.content_with_url.replaceAll("\\", "")
															.replaceAll("``", "“")
															.replaceAll("\"", "”")
															.replaceAll("-LRB-", "(")
															.replaceAll("-RRB-", ")");
		var content = response.content.split("\n");
		var cont = document.getElementById("news_content");
		cont.innerHTML = "";
		var blank = "　　";
		for (para of content) {
			if (para.startsWith("　") || para.startsWith(" ")) {
				cont.innerHTML += "<p>" + para + "</p>";
			} else {
				cont.innerHTML += "<p>" + blank + para + "</p>";
			}
		}
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
		var word_seg = "";
		for (word of fix) {
			var word_class = "";
			var word_link = "";
			var entity = {};
			if (word.contain("\/url=")) {
				word_link = word.substring(word.indexOf("http"), word.length - 1);
				word = word.replace(/\/url=.*/, "");
				word_link = link_button.replace("__LINK__", word_link);
				entity['link'] = word_link;
			}
			var word_class = "";
			entity['type'] = '';
			if (word.contain('ORG')) {
				word_class += " word_org";
				entity['type'] = 'ORG';
			} else if (word.contain('PERSON')) {
				word_class += " word_per";
				entity['type'] = 'PER';
			} else if (word.contain('GPE')) {
				word_class += " word_gpe";
				entity['type'] = 'GPE';
			} else if (word.contain('MISC')) {
				word_class += " word_misc";
			} else if (word.contain('LOC')) {
				word_class += " word_loc";
				entity['type'] = 'LOC';
			} else if (word.contain('T')) {
				word_class += " word_temp";
			} else {
				word_class += " word_none";
			}
			for (tag of tags) {
				word = word.replaceAll(tag, "");
			}
			word = word.trim();
			if (entity.type.length > 0 && word.length > 1 && $.inArray(word, entity_name_set) === -1) {
				entity['name'] = word;
				entity_set.push(entity);
				expand_in_graph[word] = 0;
				entity_name_set.push(entity['name']);
			}
			word_seg += "<dd class='word_width" + word_class + "'>" + word + "</dd>"+ word_link;
		}
		$("#news_word_seg").html(word_seg);
	});
	
	var graph = new myGraph();
	for (entity of entity_set) {
		graph.addNode(entity['name'], entity['type'], entity['name']);
	}
	keepNodesOnTop();

	$("g image").on("click", function() {
		var node_name = $(this).next().text();
		if (expand_in_graph[node_name] === 1) {
			expand_in_graph[node_name] = 0;
			graph.erase(node_name);
			return;
		}
		console.log("query " + node_name);
		expand_in_graph[node_name] = 1;
		$.ajax({
			url: "http://172.31.19.39/hanzhe/ontologyDemo/triple-json/getTripleJson.php",
			data: {
				title: node_name
			},
			type: "GET",
			contentType: "application/json; charset=utf-8",
			dataType: "text",
		}).done(function(response) {
			if (response == "no") return;
			response = JSON.parse(response);
			var new_nodes = response.nodes;
			var new_links = response.edges;
			new_nodes[0].name = node_name;
			for (node of new_nodes) {
				graph.addNode(node.name, node.type, node_name);
			}
			for (edge of new_links) {
				graph.addLink(new_nodes[edge.source].name, new_nodes[edge.target].name, 10, edge.description);
			}
			keepNodesOnTop();
		});
	});
});

function addToolTip(image) {
	var temp = image.attr("transform").split("(")[1].split(")")[0].split(",");
	var x = parseFloat(temp[0]);
    var y = parseFloat(temp[1]);
    // var r = parseFloat(image.attr("width")) / 2;
    var r = 20;
    var margin = 20;
    var text = image.attr("id");
    var tooltip = d3.select("svg")
    				.append("text")
    				.text(text)
    				.attr("x", x)
    				.attr("y", y)
    				.attr("dy", -r)
    				.attr("id", "tooltip");
    var offset = tooltip.node().getBBox().width / 2;

    if ((x - offset) < 0) {
        tooltip.attr("text-anchor", "start");
        tooltip.attr("dx", -r);
    }
    else if ((x + offset) > (width - margin)) {
        tooltip.attr("text-anchor", "end");
        tooltip.attr("dx", r);
    }
    else {
        tooltip.attr("text-anchor", "middle");
        tooltip.attr("dx", 0);
    }
}

function myGraph() {
	this.nodes_id = [];
	this.addNode = function(id, type, father) {
		if ($.inArray(id, this.nodes_id) != -1) return;
		if (findNodeIndex(id) != -1) return;
		nodes.push({"id": id, "type": type, "father": father});
		if (id == father) this.nodes_id.push(id);
		update();
	}
	this.removeNode = function(id) {
		var i = 0;
		var n = findNode(id);
		while (i < links.length) {
			if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
				links.splice(i, 1);
			}
			else i++;
		}
		nodes.splice(findNodeIndex(id), 1);
		update();
	};
	this.removeLink = function(source, target) {
		for (var i = 0; i < links.length; i++) {
			if (links[i].source.id == source && links[i].target.id == target) {
				links.splice(i, 1);
				break;
			}
		}
		update();
	};
	this.removeallLinks = function () {
		links.splice(0, links.length);
		update();
	};
	this.removeAllNodes = function () {
		nodes.splice(0, links.length);
		update();
	};
	this.addLink = function (source, target, value, description) {
		links.push({"source": findNode(source), 
					"target": findNode(target), 
					"value": value,
					"description": source + "," + target + "," + description});
		update();
	};
	this.erase = function(id) {
		var subnodes = [];
		for (node of nodes) {
			if (node["id"] != id && node["father"] == id) {
				subnodes.push(node["id"]);
			}
		}
		for (node_id of subnodes) {
			this.removeNode(node_id);
		}
	};

	var findNode = function (id) {
		for (var i in nodes) {
			if (nodes[i]["id"] === id) {
				return nodes[i];
			}
		}
	};

	var findNodeIndex = function (id) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id == id) {
				return i;
			}
		}
		return -1;
	};

	var w = $("#entity_relation").width();
	if (w > 950) w = 950;
	var h = $("#entity_relation").height();

	var vis = d3.select("#entity_relation")
				.append("svg:svg")
				.attr("width", w)
				.attr("height", h)
				.attr("id", "svg")
				.attr("pointer-events", "all")
				.attr("viewBox", "0 0 " + w + " " + h)
				.attr("perserveAspectRatio", "xMinYMid")
				.append('svg:g');
	var force = d3.layout.force();

	var nodes = force.nodes(),
		links = force.links();

	var update = function () {
		var link = vis.selectAll("line")
					  .data(links, function (d) {
						  return d.source.id + "-" + d.target.id;
					  });

		link.enter().append("line")
			.attr("id", function (d) {
				return d.description;
			})
			.attr("stroke-width", function (d) {
				return d.value / 10;
			})
			.attr("class", "link");

		link.on("mouseover", function(d, i) { addLinkTip(d3.select(this)); })
			.on("mouseout", function(d, i) { d3.select("#tooltip").remove(); });

		link.exit().remove();

		var node = vis.selectAll("g.node")
					.data(nodes)
					.attr("id", function(d) {
						return d.id;
					})
					.on("mouseover", mouseover)
					.on("mouseout", mouseout);

		var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.call(force.drag);

		nodeEnter.append("svg:image")
				.attr("xlink:href", function(d) {
					var link = "/front/img/icons/";
					var candi = font_mapping[d.type];
					var index = getRandomInt(0, candi.length - 1);
					return link + candi[index] + ".png";
				})
				.attr("class", "nodeStrokeClass")
				.attr("x", function(d) {
					if (d.id == d.father) return -25;
					else return -10; 
				})
				.attr("y", function(d) {
					if (d.id == d.father) return -25;
					else return -10; 
				})
				.attr("width", function(d) {
					if (d.id == d.father) return 40;
					else return 20; 
				})
				.attr("height", function(d) {
					if (d.id == d.father) return 40;
					else return 20;
				});

		nodeEnter.append("svg:text")
			.attr("dx", 12)
			.attr("dy", ".35em")
			.attr("class", "textClass")
			.text(function(d) { 
				if (d.id == d.father) return d.id;
				else return "";
			});

		node.exit().remove();

		force.on("tick", function () {
			link.attr("x1", function (d) {
				return d.source.x;
			})
			.attr("y1", function (d) {
				return d.source.y;
			})
			.attr("x2", function (d) {
				return d.target.x;
			})
			.attr("y2", function (d) {
				return d.target.y;
			});
			node.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		});

		force.gravity(.05)
			.charge(-120)
			.linkDistance(120)
			.size([w, h])
			.start();
	};
	update();
}

function keepNodesOnTop() {
	$(".nodeStrokeClass").each(function(index) {
		var gnode = this.parentNode;
		gnode.parentNode.appendChild(gnode);
	});
}

function mouseover(d, i) {
	var name = d3.select(this).select("text").text();
	if (name.length > 0) return;
	d3.select(this).select("image").transition()
		.duration(600)
		.attr("x", -25)
		.attr("y", -25)
		.attr("width", 40)
		.attr("height", 40);
	addToolTip(d3.select(this));
}

function mouseout() {
	var name = d3.select(this).select("text").text();
	if (name.length > 0) return;
	d3.select(this).select("image").transition()
		.duration(600)
		.attr("x", -10)
		.attr("y", -10)
		.attr("width", 20)
		.attr("height", 20);
	d3.select("#tooltip").remove();
}

function addLinkTip(line) {
	var x = (parseFloat(line.attr("x1")) + parseFloat(line.attr("x2"))) / 2;
    var y = (parseFloat(line.attr("y1")) + parseFloat(line.attr("y2"))) / 2;
    var r = 20;
    var margin = 20;
    var temp_text = line.attr("id").split(',');
    var text = "source: " + temp_text[0] +
    			"target: " + temp_text[1] +
    			"relation: " + temp_text[2];
    var tooltip = d3.select("svg")
    				.append("text")
    				.text(text)
    				.attr("x", x)
    				.attr("y", y)
    				.attr("dy", -r)
    				.attr("id", "tooltip");
    var offset = tooltip.node().getBBox().width / 2;

    if ((x - offset) < 0) {
        tooltip.attr("text-anchor", "start");
        tooltip.attr("dx", -r);
    }
    else if ((x + offset) > (width - margin)) {
        tooltip.attr("text-anchor", "end");
        tooltip.attr("dx", r);
    }
    else {
        tooltip.attr("text-anchor", "middle");
        tooltip.attr("dx", 0);
    }
}