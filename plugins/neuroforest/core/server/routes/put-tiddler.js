/*\
title: $:/plugins/neuroforest/core/server/routes/put-tiddler.js
module-type: route
type: application/javascript

PUT /neuro/tiddlers/:title
\*/
(function() {

"use strict";

exports.method = "PUT";

exports.path = /^\/neuro\/tiddlers\/(.+)$/;

exports.handler = function(request,response,state) {
	var title = $tw.utils.decodeURIComponentSafe(state.params[0]),
	  fields = JSON.parse(state.data);
	// Pull up any subfields in the `fields` object
	if(fields.fields) {
		$tw.utils.each(fields.fields,function(field,name) {
			fields[name] = field;
		});
		delete fields.fields;
	}
	// Remove any revision field
	if(fields.revision) {
		delete fields.revision;
	}

	// Get current tiddler
	var current = $tw.wiki.getTiddler("test")

	state.wiki.addTiddler(new $tw.Tiddler(
    $tw.wiki.getCreationFields(),
    $tw.wiki.getTiddler(title),
    fields,
    {title: title},
    $tw.wiki.getModificationFields()
	));
	var changeCount = state.wiki.getChangeCount(title).toString();
	response.writeHead(204, "OK",{
		"Content-Type": "text/plain"
	});
	response.end();
};

}());
