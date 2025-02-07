/*\
title: $:/plugins/neuroforest/core/server/routes/get-filter-output.js
type: application/javascript
module-type: route

GET /neuro/filter?filter=<filter>

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.method = "GET";

exports.path = /^\/neuro\/filter$/;

exports.handler = function(request,response,state) {
  var filter = state.queryParameters.filter || "";
  console.log(filter);
  if($tw.wiki.getTiddlerText("$:/config/Server/AllowAllExternalFilters") !== "yes") {
    if($tw.wiki.getTiddlerText("$:/config/Server/ExternalFilters/" + filter) !== "yes") {
      console.log("Blocked attempt to GET /recipes/default/tiddlers/tiddlers.json with filter: " + filter);
      response.writeHead(403);
      response.end();
      return;
    }
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  var filterOutput = state.wiki.filterTiddlers(filter);
  console.log(filterOutput);
  var text = JSON.stringify(filterOutput);
  response.end(text,"utf8");
};

}());