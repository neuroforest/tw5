/*\
title: $:/plugins/neuroforest/core/filters/neuro.js
type: application/javascript
module-type: filteroperator
\*/
(function(){

"use strict";
  
function getTaxonChain(title) {
	var count;
	var tiddler = $tw.wiki.getTiddler(title);
	var taxonChain = [];
	while(true) {
		var primary = $tw.utils.getPrimary(tiddler);
		var primaryTiddler = $tw.wiki.getTiddler(primary);
	  
	  	// Reached the root of the taxon tree
		if (primary === "ORGANISM") {
			return taxonChain;
		}
	  	// Reached the root of them all
	 	if (primary === "Contents") {
			return taxonChain;
		}
	  
		// Checking the neuro.primary validity
		if (! (primaryTiddler && primary)) {
			console.error(
				"Taxon chain is broken for "
				+ title 
			 	+ ", chain: "
				+ taxonChain
			 	+ ", broke at: "
				+ "???"
			);
			return taxonChain;
		}
		if (primary.startsWith(".bt-")) {
			taxonChain.push(primary);
		}

	  	tiddler = primaryTiddler;
	  
		// Safety mechanis,
		if (count > 100) {
			console.log("Infinite loop, breaking.");
			return taxonChain;
		}
	 	count ++;
	}
}

exports.neuro = function(source, operator, options) {
	var results = [];
	var unsorted = [];
	if(operator.suffix === "taxon") { 
		// Get organism to ORGANISM tiddler array
		source(function(tiddler,title) {
			var taxonChain = getTaxonChain(title).reverse();
			results.push(...taxonChain);
		});
	} else {
		
	}
	return results;
};

})();
