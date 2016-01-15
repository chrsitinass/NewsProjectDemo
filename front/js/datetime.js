// Create a list of day and monthnames.
var weekdays = [
		"Sunday", "Monday", "Tuesday",
		"Wednesday", "Thursday", "Friday",
		"Saturday"
	];
var months = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];

// Append a suffix to dates.
function nth (d) {
	if(d>3 && d<21) return 'th';
	switch (d % 10) {
		case 1:  return "st";
		case 2:  return "nd";
		case 3:  return "rd";
		default: return "th";
	}
}

// Create a string representation of the date.
function formatDate (date) {
	var month = date.get("month") + 1;
	return date.get("year") + "-" + month + "-" + date.get("date");
	/*
	return weekdays[date.get('day')] + ", " +
        date.get('date') + nth(date.get('date')) + " " +
        months[date.get('month')] + " " +
        date.get('year');
    */
}

$(document).ready(function() {
	var slider = document.getElementById('range');
	var first_day = moment().subtract(1, 'years');
	$.ajax({
		url: '/api/count_news_by_date',
		contentType: "application/json; charset=utf-8",
		dataType: "text"
	}).done(function(response) {
		response = JSON.parse(response);
		var data = [];
		var range = [];
		for (d of response) {
			var cur = moment(d['date']);
			if (cur > first_day) {
				data.push([Date.UTC(cur.get('year'), cur.get('month'), cur.get('date')), d['count']]);
				range.push(cur.valueOf());
			}
		}
		var number = range.length
		noUiSlider.create(slider, {
			start: [ range[0], range[number - 1] ], // Handle start position
			margin: 20, // Handles must be more than '20' apart
			connect: true, // Display a colored bar between the handles
			behaviour: 'tap-drag', // Move handle on tap, bar is draggable
			step: 24 * 3600000,
			range: {
				'min': range[0],
				'max': range[number - 1]
			}
		});

		var basic_chart_options = {
			chart: {
				type: 'line'
			},
			title: {
            	text: ''
        	},
			xAxis: {
				type: 'datetime',
				dateTimeLabelFormats: {
					month: '%e. %b',
					year: '%b'
				},
				title: {
					text: 'Date'
				}
			},
			yAxis: {
				title: {
					text: ''
				}
			},
			legend: {
				enabled: false
			},
			plotOptions: {
            	line: {
                	lineWidth: 3,
                	states: {
                    	hover: {
                        	lineWidth: 4
                    	}
                	},
                	marker: {
                    	enabled: false
                	},
                	pointInterval: 3600000 * 24,
                	color: "#3498db"
            	}
        	}
		};
		var chart_options = basic_chart_options;
		chart_options.series = [{
				name: '新闻数量',
				data: data
		}];
		$('#container').highcharts(chart_options);
		var container = $("#container").highcharts();

		slider.noUiSlider.on('update', function(values, handle){
			var startDate = parseInt(values[0]);
			var endDate = parseInt(values[1]);
			if (handle == 0) {
				$("#from-text").attr('placeholder', formatDate(moment(startDate)));
			} else {
				$("#to-text").attr('placeholder', formatDate(moment(endDate)));
			}
			var new_data = [];
			for (dd of data) {
				if (dd[0] >= startDate) {
					if (dd[0] <= endDate) {
						new_data.push(dd);
					} else {
						break;
					}
				}
			}
			var plotBands = {
				id: 'last',
				from: startDate,
				to: endDate,
				color: '#FCFCDE'
			};
			container.xAxis[0].removePlotBand('last');
			container.xAxis[0].addPlotBand(plotBands);

			var new_chart_options = basic_chart_options;
			new_chart_options.series = [{
				name: '新闻数量', 
				data: new_data
			}];
			$("#container2").highcharts(new_chart_options);
		});
	});
});