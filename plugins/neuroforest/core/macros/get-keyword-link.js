/*\
title: $:/plugins/neuroforest/core/macros/get-keyword-link.js
type: application/javascript
module-type: macro

Resolve neuro.keyword to provide its tiddler title

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "get-keyword-link";

exports.params = [];

exports.run = function(keyword) {
  var keywordTitle = $tw.utils.resolveKeyword(keyword);
  if (! keywordTitle) {
    return "none"
  } else {
    var keywordTiddler = $tw.wiki.getTiddler(keywordTitle);
    return keywordTiddler.getLink();
  }
};

})();