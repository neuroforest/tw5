/*\
title: $:/plugins/neuroforest/core/macros/get-name.js
type: application/javascript
module-type: macro
\*/
(function(){

"use strict";

exports.name = "get-name";

exports.params = [
  {"name": "title"}
];

exports.run = function(title) {
  var tiddler = $tw.wiki.getTiddler(title);
  tiddler.getName();
};

})();
