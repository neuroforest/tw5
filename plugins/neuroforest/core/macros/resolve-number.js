/*\
title: $:/plugins/neuroforest/core/macros/resolve-number.js
type: application/javascript
module-type: macro

Add decimal spaces to number

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "resolve-number";

exports.params = [
  {"name": "number"},
  {"name": "keyword"}
];

exports.run = function(number, keyword) {
  var keywordTitle = $tw.utils.resolveKeyword(keyword);
  var keywordTiddler = $tw.wiki.getTiddler(keywordTitle);

  // Try to obtain unit
  if (keywordTiddler && "unit" in keywordTiddler.fields) {
    var unit = " " + keywordTiddler.fields["unit"];
  } else {
    var unit = "";
  }

  var numberParts = number.split(".");
  var decimal = numberParts.length === 2 ? "." + numberParts[1] : ""
  var integer = parseInt(numberParts[0]);
  var integerLocale = integer.toLocaleString("en-US");
  return integerLocale + decimal + unit;
};

})();