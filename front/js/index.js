$(document).ready(function() {
	$.ajax({
		type: "GET",
		url: "/api/get_news_sources",
		contentType: "application/json",
		dataType: "text"
	}).done(function(response) {
		alert(response);
	});
});