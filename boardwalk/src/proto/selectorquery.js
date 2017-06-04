/**
 * @fileoverview
 * @enhanceable
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

goog.provide('proto.io.nevill.boardwalk.SelectorQuery');

goog.require('jspb.Message');
goog.require('jspb.BinaryReader');
goog.require('jspb.BinaryWriter');
goog.require('jspb.Map');


/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.io.nevill.boardwalk.SelectorQuery = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.io.nevill.boardwalk.SelectorQuery, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.io.nevill.boardwalk.SelectorQuery.displayName = 'proto.io.nevill.boardwalk.SelectorQuery';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.io.nevill.boardwalk.SelectorQuery.prototype.toObject = function(opt_includeInstance) {
  return proto.io.nevill.boardwalk.SelectorQuery.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.io.nevill.boardwalk.SelectorQuery} msg The msg instance to transform.
 * @return {!Object}
 */
proto.io.nevill.boardwalk.SelectorQuery.toObject = function(includeInstance, msg) {
  var f, obj = {
    query: jspb.Message.getFieldWithDefault(msg, 1, ""),
    source: jspb.Message.getFieldWithDefault(msg, 2, ""),
    label: jspb.Message.getFieldWithDefault(msg, 3, ""),
    matchMap: (f = msg.getMatchMap()) ? f.toObject(includeInstance, undefined) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.io.nevill.boardwalk.SelectorQuery}
 */
proto.io.nevill.boardwalk.SelectorQuery.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.io.nevill.boardwalk.SelectorQuery;
  return proto.io.nevill.boardwalk.SelectorQuery.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.io.nevill.boardwalk.SelectorQuery} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.io.nevill.boardwalk.SelectorQuery}
 */
proto.io.nevill.boardwalk.SelectorQuery.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setQuery(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setSource(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 4:
      var value = msg.getMatchMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readString);
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.io.nevill.boardwalk.SelectorQuery.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.io.nevill.boardwalk.SelectorQuery.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.io.nevill.boardwalk.SelectorQuery} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.io.nevill.boardwalk.SelectorQuery.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getQuery();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSource();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getMatchMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(4, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeString);
  }
};


/**
 * optional string query = 1;
 * @return {string}
 */
proto.io.nevill.boardwalk.SelectorQuery.prototype.getQuery = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.io.nevill.boardwalk.SelectorQuery.prototype.setQuery = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional string source = 2;
 * @return {string}
 */
proto.io.nevill.boardwalk.SelectorQuery.prototype.getSource = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.io.nevill.boardwalk.SelectorQuery.prototype.setSource = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional string label = 3;
 * @return {string}
 */
proto.io.nevill.boardwalk.SelectorQuery.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.io.nevill.boardwalk.SelectorQuery.prototype.setLabel = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * map<string, string> match = 4;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,string>}
 */
proto.io.nevill.boardwalk.SelectorQuery.prototype.getMatchMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,string>} */ (
      jspb.Message.getMapField(this, 4, opt_noLazyCreate,
      null));
};


proto.io.nevill.boardwalk.SelectorQuery.prototype.clearMatchMap = function() {
  this.getMatchMap().clear();
};

