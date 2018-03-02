$(document).ready(function() {

var size = 50,
    newsContent=$('#title'),
    newsText = newsContent.text();
    
if(newsText.length > size){
	newsContent.text(newsText.slice(0, size) + ' ...')};

});


