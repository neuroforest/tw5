/*\
title: $:/plugins/neuroforest/neo4j-syncadaptor/neo4jsyncadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising TiddlyWiki tiddlers with a Neo4j database using the node.js driver.
This implementation strictly follows the TiddlyWiki SyncAdaptorModules specification.

\*/

"use strict";

// Get a reference to the Neo4j driver
const neo4jDriver = $tw.node ? require("neo4j-driver") : null;

// Helper to convert an async Promise to a TiddlyWiki callback style (err, result)
function promiseToCallback(promise, callback) {
  promise.then(result => callback(null, result))
    .catch(error => callback(error));
}

function Neo4jAdaptor(options) {
	var self = this;
	this.wiki = options.wiki;
	this.logger = new $tw.utils.Logger("neo4j", {colour: "blue"});
  this.mark = new $tw.utils.Logger("neo4j", {colour: "red"});
    
  // Internal state tracking
  this.driver = null;
  this.isConnected = false;
  
  // Configuration retrieval from TiddlyWiki config tiddlers
  this.uri = this.wiki.getTiddlerText("$:/config/Neo4j/URI", process.env.NEO4J_URI);
  this.user = this.wiki.getTiddlerText("$:/config/Neo4j/User", process.env.NEO4J_USER);
  this.password = this.wiki.getTiddlerText("$:/config/Neo4j/Password", process.env.NEO4J_PASSWORD);
  
  if ($tw.node && neo4jDriver) {
    // Asynchronously connect to the database upon adaptor creation
    this.connect().catch(err => {
      self.logger.log("Initial Neo4j connection failed: " + err.message);
    });
  }
}

// --- Basic Adaptor Metadata ---
Neo4jAdaptor.prototype.name = "neo4j";

// We set this to false. The adaptor will query all updated tiddlers via getUpdatedTiddlers.
Neo4jAdaptor.prototype.supportsLazyLoading = false;

// --- Connection and Readiness ---

// Asynchronously establishes and verifies the Neo4j connection
Neo4jAdaptor.prototype.connect = async function() {
  this.logger.log("Attempting to connect to Neo4j at " + this.uri);

  // Create the Driver instance
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
  // Using default database, adjust if necessary
  return this.driver.session({ database: "neo4j" });
};

// --- Tiddler Info (for tracking) ---

/*
getTiddlerInfo returns the adaptor-specific metadata stored with the tiddler.
This is used by the syncer to track external revisions.
We simply retrieve the existing 'adaptorInfo' field.
*/
Neo4jAdaptor.prototype.getTiddlerInfo = function(tiddler) {
  // Returns the existing adaptorInfo for the tiddler, or null/undefined
	return tiddler.fields.title;
};

// getTiddlerFileInfo is not required by the standard spec and is irrelevant for a DB adaptor.

// --- Saving a Tiddler ---

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
    MERGE (n:Object {title: $title})
    ON CREATE SET
      n += $fields,
      n.created = $now,
      n.modified = $now
    ON MATCH SET
      n += $fields,
      n.modified = $now
    RETURN n.modified AS modified, elementId(n) AS neo4jId
  `;

  function buildQueryString(query, params) {
    let finalQuery = query;
    for (const key in params) {
      const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
      // Simple replace; assumes parameter names start with $
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

      // Extract new adaptor info and revision
      const record = result.records[0];
      const modified = Number(record.get("modified")); // Use toNumber() for compatibility
      const neo4jId = Number(record.get("neo4jId"));

      // Return adaptorInfo and the revision number (timestamp)
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

// --- Deleting a Tiddler ---

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
    MATCH (n:Object {title: $title})
    DETACH DELETE n
    RETURN count(n) AS deletedCount
  `;

  const runTransaction = session.run(cypherQuery, { title: title });

  promiseToCallback(
    runTransaction.then(result => {
      session.close();
      const deletedCount = result.records[0].get("deletedCount").toNumber();

      if (deletedCount === 0) {
       self.logger.log(`Tiddler "${title}" not found in Neo4j (already deleted).`);
      }

      // TiddlyWiki expects a null adaptorInfo on successful deletion
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