/*\
title: $:/plugins/neuroforest/core/macros/get-link.js
type: application/javascript
module-type: macro
\*/
(function(){

"use strict";

exports.name = "get-link";

exports.params = [];

exports.run = function(title) {
  var tiddler = $tw.wiki.getTiddler(title);
  if (! tiddler) {
    return;
  }

  var link;
  var name = tiddler.getName();
  if (name !== tiddler) {
    link = "[[" + name + "|" + title + "]]";
  } else {
    link = "[[" + title + "]]";
  }
  return link;
};

})();
  