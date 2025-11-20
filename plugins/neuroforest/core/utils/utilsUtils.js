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


/*
Generate UUID v4
Source: https://github.com/felixhayashi/TW5-TiddlyMap
*/
exports.genUUID = function () {
  const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
  const uuid = [];
  let rnd = 0, r;

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid[i] = "-";
    } else if (i === 14) {
      uuid[i] = "4";
    } else {
      if (rnd <= 0x02) {
        rnd = (Math.random() * 0x100000000) | 0;
      }
      r = rnd & 0xf;
      rnd >>= 4;
      uuid[i] = CHARS[i === 19 ? (r & 0x3) | 0x8 : r];
    }
  }

  return uuid.join("");
};

})();