/*\
title: $:/plugins/neuroforest/core/utils/utilsUtils.js
module-type: utils
type: application/javascript

\*/
(function() {

"use strict";

exports.getLink = function(tiddler) {
  var link;
  var name = tiddler.getName();
  	var title = tiddler.fields.title;
  if (name === title) {
    link = "[[" + title + "]]";
  } else {
    link = "[[" + name + "|" + title + "]]";
  }
  return link;
};
  
exports.customSort = function(tiddlerA, tiddlerB) {
  var cSortA = tiddlerA.fields["custom-sort"],
    cSortB = tiddlerB.fields["custom-sort"];
  if (cSortA && cSortB) {
    if (cSortA < cSortB) {
      return -1;
    } else if (cSortA > cSortB) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};
  
  
exports.getPrimary = function(tiddler) {
  if (! tiddler) {
    return undefined;
  }
  var neuroPrimary = tiddler.fields["neuro.primary"];
  	if (neuroPrimary) {
    return neuroPrimary;
  }
  
  // Setting neuro primary
  var tiddlerTags = tiddler.fields.tags;
  if (!tiddler.fields.tags || tiddlerTags.length === 0 || !tiddler.fields["title"].startsWith("$")) {
    console.error(
      "Tiddler " 
      + tiddler.fields.title
      + " has no tags."
    );
   	return neuroPrimary; // undefined
  } else if (tiddlerTags.length === 1) {
    neuroPrimary = tiddlerTags[0];
  } else {
    console.error(
      "Could not set neuro.primary for "
      + tiddler.fields.title
    );
   	return neuroPrimary; // undefined
  }
  
  // Saving the new neuro.primary into the wiki
  var newTiddler = new $tw.Tiddler(
    tiddler.fields, 
    {"neuro.primary": neuroPrimary}
  );
  $tw.wiki.addTiddler(newTiddler);

  // Return the newly acquired neuro.primary.
  return neuroPrimary;
};


exports.resolveKeyword = function(keyword) {
  var filter = `[field:neuro.keyword[${keyword}]]`;
  var tiddlerMatches = $tw.wiki.filterTiddlers(filter);

  if (tiddlerMatches) {
    return tiddlerMatches[0];
  } else {
    console.error("Not found: " + keyword);
    return "";
  }
};


})();