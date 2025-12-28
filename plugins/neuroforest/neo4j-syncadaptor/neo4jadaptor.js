/*\
title: $:/plugins/neuroforest/neo4j-syncadaptor/neo4jsyncadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising Tiddlywiki5 node.js server with a Neo4j database.
\*/

"use strict";

const neo4jDriver = $tw.node ? require("neo4j-driver") : null;

// Helper to convert an async Promise to a TiddlyWiki callback style (err, result)
function promiseToCallback(promise, callback) {
  promise.then(result => callback(null, result))
    .catch(error => callback(error));
}

// Create Neo4j adaptor
function Neo4jAdaptor(options) {
	var self = this;
	this.wiki = options.wiki;
	this.logger = new $tw.utils.Logger("neo4j", {colour: "blue"});
    
  // Internal state tracking
  this.driver = null;
  this.isConnected = false;
  
  // Configuration retrieval from TiddlyWiki config tiddlers
  this.uri = this.wiki.getTiddlerText("$:/config/Neo4j/URI", process.env.NEO4J_URI);
  this.user = this.wiki.getTiddlerText("$:/config/Neo4j/User", process.env.NEO4J_USER);
  this.password = this.wiki.getTiddlerText("$:/config/Neo4j/Password", process.env.NEO4J_PASSWORD);
  
  // Asynchronously connect to the database upon adaptor creation
  if ($tw.node && neo4jDriver) {
    this.connect().catch(err => {
      self.logger.log("Initial Neo4j connection failed: " + err.message);
    });
  }
}

// Basic adaptor metadata
Neo4jAdaptor.prototype.name = "neo4j";
Neo4jAdaptor.prototype.supportsLazyLoading = false;

// --- Connection and Readiness ---

// Asynchronously establishes and verifies the Neo4j connection
Neo4jAdaptor.prototype.connect = async function() {
  this.logger.log("Attempting to connect to Neo4j at " + this.uri);

  this.driver = neo4jDriver.driver(
    this.uri,
    neo4jDriver.auth.basic(this.user, this.password)
  );

  try {
    // Verify connection
    await this.driver.verifyConnectivity();
    this.isConnected = true;
    this.logger.log("Neo4j connection verified successfully.");
  } catch (err) {
    this.isConnected = false;
    this.logger.log("Connection failed: " + err.message);
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
    throw err;
  }
};

// Synchronous check used by TiddlyWiki core
Neo4jAdaptor.prototype.isReady = function() {
	return $tw.node && !!neo4jDriver && this.isConnected;
};

// --- Neo4j Session Management ---

// Helper to get a new session for a transaction
Neo4jAdaptor.prototype.getSession = function() {
  if (!this.driver) {
    throw new Error("Neo4j driver is not available or not connected.");
  }
  return this.driver.session({ database: "neo4j" });
};

/*
getTiddlerInfo returns the adaptor-specific metadata stored with the tiddler.
This is used by the syncer to track external revisions.
*/
Neo4jAdaptor.prototype.getTiddlerInfo = function(tiddler) {
	return {
		bag: tiddler.fields.bag
		}
  };

// -- Neo4j Database Operations --

/*
Save a tiddler and invoke the callback with (err, adaptorInfo, revision)
The revision will be the Neo4j modified timestamp.
*/
Neo4jAdaptor.prototype.saveTiddler = function(tiddler, callback, options) {
  var self = this;
  if (!this.isConnected) {
    return callback("Neo4j adaptor is not connected.");
  }

  const title = tiddler.fields.title;
  const session = this.getSession();

  // Convert Tiddler fields to a plain object for Cypher parameters
  const tiddlerFields = JSON.parse(JSON.stringify(tiddler.fields));

  // Cypher: MERGE on title, update all properties, and set a new 'modified' timestamp
  var now = new Date().toISOString();
  const cypherQuery = `
    MERGE (o:Object {title: $title})
    ON CREATE SET
      o = $fields,
      o.created = $now,
      o.modified = $now
    ON MATCH SET
      o = {},
      o += $fields,
      o.modified = $now
    RETURN o.modified AS modified, elementId(o) AS neo4jId;
  `;

  function buildQueryString(query, params) {
    let finalQuery = query;
    for (const key in params) {
      const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
      finalQuery = finalQuery.replace(new RegExp(`\\$${key}`, 'g'), value);
    }
    return finalQuery;
  }

  const runTransaction = session.run(cypherQuery, {
    now: now,
    title: title,
    fields: tiddlerFields
  });

  promiseToCallback(
    runTransaction.then(result => {
      session.close();
      if (result.records.length === 0) {
        throw new Error("Failed to retrieve new adaptor info after save.");
      }
      // Extract new adaptor info
      const record = result.records[0];
      const modified = Number(record.get("modified"));
      const neo4jId = Number(record.get("neo4jId"));

      // Return adaptorInfo
      return [neo4jId, modified];
    })
    .catch(err => {
      session.close();
      self.logger.log(`Error saving tiddler "${title}": ${err.message}`);
      throw err;
    }),
    callback
  );
};

/*
Delete a tiddler and invoke the callback with (err)
*/
Neo4jAdaptor.prototype.deleteTiddler = function(title, callback, options) {
  var self = this;
  if (!this.isConnected) {
    return callback("Neo4j adaptor is not connected.");
  }

  const session = this.getSession();

  // Delete the Tiddler node and all its relationships
  const cypherQuery = `
    MATCH (o:Object {title: $title})
    DETACH DELETE o
    RETURN count(o) AS deletedCount;
  `;

  const runTransaction = session.run(cypherQuery, { title: title });

  promiseToCallback(
    runTransaction.then(result => {
      session.close();
      const deletedCount = Number(result.records[0].get("deletedCount"));
      if (deletedCount === 0) {
       self.logger.log(`Tiddler "${title}" not found in Neo4j (already deleted).`);
      }
      return null;
    })
    .catch(err => {
      session.close();
      self.logger.log(`Error deleting tiddler "${title}": ${err.message}`);
      throw err;
    }),
    callback
  );
};

// --- TiddlyWiki required export ---
if(neo4jDriver) {
	exports.adaptorClass = Neo4jAdaptor;
}