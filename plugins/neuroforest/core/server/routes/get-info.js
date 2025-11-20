/*\
title: $:/plugins/neuroforest/core/server/routes/get-info.js
module-type: route
type: application/javascript
GET /neuro/info
\*/
(function() {

"use strict";

exports.method = "GET";

exports.path = /^\/neuro\/info$/;

exports.handler = function(request,response,state) {
  var info = {
    "local-path": $tw.boot.wikiTiddlersPath,
    "dirty": $tw.syncer.isDirty()
  }
  // Write response
  response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
  response.end(JSON.stringify(info),"utf8");
};

}());