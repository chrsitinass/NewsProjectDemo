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
	return weekdays[date.get('day')] + ", " +
		date.get('date') + nth(date.get('date')) + " " +
		months[date.get('month')] + " " +
		date.get('year');
}

$(document).ready(function() {
	var slider = document.getElementById('range');
	var first_day = moment().subtract(3, 'months');
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
				data.push([ Date.UTC(cur.get('year'), cur.get('month'), cur.get('date')), d['count'] ]);
				range.push(cur.valueOf());
			}
		}
		var number = range.length
		/*
		noUiSlider.create(slider, {
			start: [ range[0], range[number - 1] ], // Handle start position
			margin: 20, // Handles must be more than '20' apart
			connect: true, // Display a colored bar between the handles
			direction: 'rtl', // Put '0' at the bottom of the slider
			behaviour: 'tap-drag', // Move handle on tap, bar is draggable
			step: 24 * 3600000,
			range: {
				'min': range[0],
				'max': range[number - 1]
			},
			pips: { // Show a scale with the slider
				mode: 'steps',
				density: 24 * 3600000
			}
		});

		var tipHandles = $('.noUi-handle');
		var tooltips = [];
		for (var i = 0; i < tipHandles.length; i++) {
			tooltips[i] = document.createElement('div');
			tipHandles[i].appendChild(tooltips[i]);

			tooltips[i].className += 'tooltips';
			tooltips[i].innerHTML = '<strong>Value: </strong><span></span>';
			tooltips[i] = tooltips[i].getElementsByTagName('span')[0];
		}
		slider.noUiSlider.on('update', function(values, handle){
			console.log(handle);
			tooltips[handle].innerHTML = formatDate(moment(parseInt(values[handle])));
		});
		*/
		var chart_options = {
			chart: {
				type: 'spline',
				zoomType: 'x'
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
            	spline: {
                	lineWidth: 4,
                	states: {
                    	hover: {
                        	lineWidth: 5
                    	}
                	},
                	marker: {
                    	enabled: false
                	},
                	pointInterval: 3600000 * 24,
            	}
        	},
        	plotBands: [{

        	}],
			series: [{
				name: 'total',
				data: data
			}]
		};
		$('#container').highcharts(chart_options);
	});
});