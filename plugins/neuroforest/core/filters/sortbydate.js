/*\
title: $:/plugins/neuroforest/core/filters/sortbydate.js
type: application/javascript
module-type: filteroperator
\*/
(function(){

"use strict";

exports.sortbydate = function(source) {
	var titles = prepareResults(source);
	var results = [];
	var resultsMap = {};

  // Create a dictionary of titles and numeric formats
  for (var i in titles) {
    var title = titles[i];
    var dateNumeric = convertToNumeric(title);
    resultsMap[dateNumeric] = title;
  }

  // Sort numeric formats and add to reults
  var sortedKeys = Object.keys(resultsMap).sort()
  for (var i in sortedKeys) {
    var key = sortedKeys[i];
    results.push(resultsMap[key]);
  }

	return results;
};

function convertToNumeric(title) {
  const months = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09",
    "October": "10",
    "November": "11",
    "December": "12"
  }
  var titleParts = title.split(" ");
  var day = titleParts[0].padStart(2, "0");
  var month = months[titleParts[1]];
  var year = (titleParts.length > 2) ? titleParts[2] : "0000";
  return parseInt(year + month + day);
};

function prepareResults(source) {
	var results = [];
	source(function(tiddler,title) {
		results.push(title);
	});
	return results;
};

})();
