var source = [
	"腾讯网", "网易", "中国新闻网", "凤凰网", "人民网", "新华网", "新浪网"
];
$(document).ready(function() {
	$.ajax({
		// url: '/api/count_news_by_source',
		url: '/api/count_news_temp?typ=source',
		contentType: "application/json; charset=utf-8",
		dataType: "text"
	}).done(function (response) {
		response = JSON.parse(response);
		var data = [];
		for (r of response) {
			data.push({
				name: r.source,
				y: r['COUNT(*)']
			});
		}
		var options = {
			chart: {
			},
			colors: ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e",
    		"#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6"],
			title: {
				text: ''
			},
			xAxis: {
				type: 'category'
			},
			yAxis: {
				title: {
					margin: 10,
					text: '数量'
				}
			},
			legend: {
				enabled: true
			},
			plotOptions: {
				series: {
					pointPadding: 0.2,
					borderWidth: 0,
					dataLabels: {
						enabled: true
					}
				},
				pie: {
					shadow: false,
					innerSize: '50%',
					plotBorderWidth: 0,
					allowPointSelect: true,
					cursor: 'pointer',
					size: '100%',
					dataLabels: {
						enabled: true,
						format: '{point.name}: <b>{point.y}</b>'
					}
				}
			},
			series: [{
				name: 'total',
				colorByPoint: true,
				data: data
			}]
		}
		/*
		var drilldown_data = {};
		for (idx in source) {
			s = source[idx];
			data.push({
				name: s,
				y: response[s]['total'],
				drilldown: true
			});
			sec_data = [];
			for (cate in response[s]) {
				if (cate == 'total') continue;
				if (response[s][cate] == 0) continue;
				sec_data.push([cate, response[s][cate]]);
			}
			drilldown_data[s] = {
				name: s,
				data: sec_data
			};
		}
		var options = {
			chart: {
				events: {
					drilldown: function(e) {
						if (!e.seriesOptions) {
							var chart = this;
							var series = drilldown_data[e.point.name];
							chart.showLoading("loading...");
							setTimeout(function() {
								chart.hideLoading();
								chart.addSeriesAsDrilldown(e.point, series);
							}, 1000);
						}
					}
				},
				plotBorderWidth: 0
			},
			colors: ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e",
    		"#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6"],
			title: {
				text: ''
			},
			xAxis: {
				type: 'category'
			},
			yAxis: {
				title: {
					margin: 10,
					text: '数量'
				}
			},
			legend: {
				enabled: true
			},
			plotOptions: {
				series: {
					pointPadding: 0.2,
					borderWidth: 0,
					dataLabels: {
						enabled: true
					}
				},
				pie: {
					shadow: false,
					innerSize: '50%',
					plotBorderWidth: 0,
					allowPointSelect: true,
					cursor: 'pointer',
					size: '100%',
					dataLabels: {
						enabled: true,
						format: '{point.name}: <b>{point.y}</b>'
					}
				}
			},
			series: [{
				name: 'total',
				colorByPoint: true,
				data: data
			}],
			drilldown: {
        		series: []
    		}
		};
		*/
		options.chart.renderTo = 'container';
		options.chart.type = 'column';
		var chart = new Highcharts.Chart(options);
		chartfunc = function() {
			var column = document.getElementById('column');
			var bar = document.getElementById('bar');
			var pie = document.getElementById('pie');
			if(column.checked) {
				options.chart.renderTo = 'container';
				options.chart.type = 'column';
			} else if(bar.checked) {
				options.chart.renderTo = 'container';
				options.chart.type = 'bar';
    		} else if(pie.checked) {
				options.chart.renderTo = 'container';
				options.chart.type = 'pie';
    		}
    		var chart = new Highcharts.Chart(options);
    	}
    });
});