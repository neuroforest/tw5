/*\
title: $:/plugins/neuroforest/core/macros/resolve-keyword.js
type: application/javascript
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "resolve-keyword";

exports.params = [];

exports.run = function(keyword) {
  var logger = new $tw.utils.Logger("neuro");
  var tiddlerMatch;
  $tw.wiki.each(function(tiddler, title) {
    var tiddlerKeyword = tiddler.fields["neuro.keyword"];
   
    if (tiddlerKeyword === keyword) {
      tiddlerMatch = tiddler;
      return;
    }
  });
  if (tiddlerMatch) {
    var link = $tw.utils.getLink(tiddlerMatch);
    return link;
    console.log("Link:" + link);
  } else {
    logger.alert("Not found: " + keyword);
    return "none";
  }
};

})();