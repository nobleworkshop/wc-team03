$(document).ready(function() {

	// Cut long post titles in cards Portfolio titles
	var portfolioTitle = $('.card-portfolio__title'); 
	maxPortfolioTitleSize = 24;
	portfolioTitle.each(function(index, value){
		var text = $(value).text()
		if (text.length > maxPortfolioTitleSize) {
			text = text.slice(0, maxPortfolioTitleSize) + '...';
		}
		$(this).text(text);
	});

	// Cut long post titles in cards Posts title
	var postTitle = $('.card-post__title'); 
	maxPostTitleSize = 40;
	postTitle.each(function(index, value){
		var text = $(value).text()
		if (text.length > maxPostTitleSize) {
			text = text.slice(0, maxPostTitleSize) + '...';
		}
		$(this).text(text);
	});

	$(".left-panel").customScrollbar({preventDefaultScroll: true});

});