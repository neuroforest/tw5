/*\
title: $:/plugins/neuroforest/core/utils/tiddlerUtils.js
module-type: tiddlermethod
type: application/javascript
\*/
(function() {

"use strict";

/* Get the name of a tiddler */
exports.getName = function() {
  // Return name if exists
  var name;
  name = this.fields["name"];
  if (name) {
    return name;
  }
  
  // Determine name if not exists
  var title = this.fields["title"];
  var prelimName;
  if (title.startsWith(".")) {
    var parts = title.split(/\s(.+)/);
    if (parts.length > 1) {
      prelimName = parts[1];
    } else {
      prelimName = title.substr(1);
    }
  } else {
    prelimName = title;
  }
  // Processing the name
  parts = prelimName.split(/\s/);
  name = "";
  if (title.startsWith(".bt-")){
    name= prelimName;
  } else {
    for (var i in parts) {
   	 	var part = parts[i];
      part = part[0].toLowerCase() + part.substr(1);
      name += part + " ";
    }
    name = name.substring(0, name.length - 1);
  }
  
  // Update tiddler
  $tw.wiki.addTiddler(new $tw.Tiddler(this.fields, {"name": name}));
  return name;
};
  
/* Get the neuro code of a tiddler */
exports.getCode = function() {
  var code = this.fields["code"]; 
  if (code) {
    return code;
  }
  
  // Obtain if not present
  var title = this.fields["title"];
  if (title.startsWith(".")) {
    var code = title.split(" ")[0].substr(1);
    $tw.wiki.addTiddler(new $tw.Tiddler(this.fields, {"neuro.code": code}))
    return code;
  }
}

/* Get neuro role of a tiddler */
exports.getRole = function() {
  if (this.hasField("neuro.role")) {
    return this.getFieldString("neuro.role");
  } else {
    var code = this.getCode();
    var encoding = "`." + code + "`";
    	var role;
    $tw.wiki.each(function(tiddler, title) {
      var tempEncoding = tiddler.fields["encoding"];
      if (tempEncoding === encoding) {
        role = tiddler.fields["neuro.keyword"];
      }
    });
    
    // Writing the code
    if (role) {
    		$tw.wiki.addTiddler(new $tw.Tiddler(this.fields, {"neuro.role": role}));
    }
  }
}

/* Get link of the tiddler using tiddler name */
exports.getLink = function() {
  var link;
  var name = this.getName();
  	var title = this.fields.title;
  if (name === title) {
    link = "[[" + title + "]]";
  } else {
    link = "[[" + name + "|" + title + "]]";
  }
  return link;
};

})();