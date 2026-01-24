/*\
title: $:/plugins/neuroforest/core/server/routes/delete-by-filter.js
type: application/javascript
module-type: route

DELETE /neuro?filter=<filter>

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.method = "DELETE";

exports.path = /^\/neuro$/;

exports.handler = function(request,response,state) {
  var filter = state.queryParameters.filter || "";
  if($tw.wiki.getTiddlerText("$:/config/Server/AllowAllExternalFilters") !== "yes") {
    if($tw.wiki.getTiddlerText("$:/config/Server/ExternalFilters/" + filter) !== "yes") {
      console.log("Blocked attempt to DELETE /neuro by filter: " + filter);
      response.writeHead(403);
      response.end();
      return;
    }
  }
  var filterOutput = state.wiki.filterTiddlers(filter);
  for (var i = 0; i < filterOutput.length; i++) {
      state.wiki.deleteTiddler(filterOutput[i]);
  }
  response.writeHead(204);
  response.end("utf8");
};

}());