/**
 * @fileoverview
 * @enhanceable
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

goog.provide('proto.io.nevill.boardwalk.ConsoleContents');

goog.require('jspb.Message');
goog.require('jspb.BinaryReader');
goog.require('jspb.BinaryWriter');
goog.require('proto.io.nevill.boardwalk.Graph');
goog.require('proto.io.nevill.boardwalk.Section');


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
proto.io.nevill.boardwalk.ConsoleContents = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.io.nevill.boardwalk.ConsoleContents.oneofGroups_);
};
goog.inherits(proto.io.nevill.boardwalk.ConsoleContents, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.io.nevill.boardwalk.ConsoleContents.displayName = 'proto.io.nevill.boardwalk.ConsoleContents';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.io.nevill.boardwalk.ConsoleContents.oneofGroups_ = [[3,4]];

/**
 * @enum {number}
 */
proto.io.nevill.boardwalk.ConsoleContents.PanelsCase = {
  PANELS_NOT_SET: 0,
  GRAPH: 3,
  SECTION: 4
};

/**
 * @return {proto.io.nevill.boardwalk.ConsoleContents.PanelsCase}
 */
proto.io.nevill.boardwalk.ConsoleContents.prototype.getPanelsCase = function() {
  return /** @type {proto.io.nevill.boardwalk.ConsoleContents.PanelsCase} */(jspb.Message.computeOneofCase(this, proto.io.nevill.boardwalk.ConsoleContents.oneofGroups_[0]));
};



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
proto.io.nevill.boardwalk.ConsoleContents.prototype.toObject = function(opt_includeInstance) {
  return proto.io.nevill.boardwalk.ConsoleContents.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.io.nevill.boardwalk.ConsoleContents} msg The msg instance to transform.
 * @return {!Object}
 */
proto.io.nevill.boardwalk.ConsoleContents.toObject = function(includeInstance, msg) {
  var f, obj = {
    graph: (f = msg.getGraph()) && proto.io.nevill.boardwalk.Graph.toObject(includeInstance, f),
    section: (f = msg.getSection()) && proto.io.nevill.boardwalk.Section.toObject(includeInstance, f)
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
 * @return {!proto.io.nevill.boardwalk.ConsoleContents}
 */
proto.io.nevill.boardwalk.ConsoleContents.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.io.nevill.boardwalk.ConsoleContents;
  return proto.io.nevill.boardwalk.ConsoleContents.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.io.nevill.boardwalk.ConsoleContents} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.io.nevill.boardwalk.ConsoleContents}
 */
proto.io.nevill.boardwalk.ConsoleContents.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 3:
      var value = new proto.io.nevill.boardwalk.Graph;
      reader.readMessage(value,proto.io.nevill.boardwalk.Graph.deserializeBinaryFromReader);
      msg.setGraph(value);
      break;
    case 4:
      var value = new proto.io.nevill.boardwalk.Section;
      reader.readMessage(value,proto.io.nevill.boardwalk.Section.deserializeBinaryFromReader);
      msg.setSection(value);
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
proto.io.nevill.boardwalk.ConsoleContents.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.io.nevill.boardwalk.ConsoleContents.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.io.nevill.boardwalk.ConsoleContents} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.io.nevill.boardwalk.ConsoleContents.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getGraph();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.io.nevill.boardwalk.Graph.serializeBinaryToWriter
    );
  }
  f = message.getSection();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.io.nevill.boardwalk.Section.serializeBinaryToWriter
    );
  }
};


/**
 * optional Graph graph = 3;
 * @return {?proto.io.nevill.boardwalk.Graph}
 */
proto.io.nevill.boardwalk.ConsoleContents.prototype.getGraph = function() {
  return /** @type{?proto.io.nevill.boardwalk.Graph} */ (
    jspb.Message.getWrapperField(this, proto.io.nevill.boardwalk.Graph, 3));
};


/** @param {?proto.io.nevill.boardwalk.Graph|undefined} value */
proto.io.nevill.boardwalk.ConsoleContents.prototype.setGraph = function(value) {
  jspb.Message.setOneofWrapperField(this, 3, proto.io.nevill.boardwalk.ConsoleContents.oneofGroups_[0], value);
};


proto.io.nevill.boardwalk.ConsoleContents.prototype.clearGraph = function() {
  this.setGraph(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.io.nevill.boardwalk.ConsoleContents.prototype.hasGraph = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional Section section = 4;
 * @return {?proto.io.nevill.boardwalk.Section}
 */
proto.io.nevill.boardwalk.ConsoleContents.prototype.getSection = function() {
  return /** @type{?proto.io.nevill.boardwalk.Section} */ (
    jspb.Message.getWrapperField(this, proto.io.nevill.boardwalk.Section, 4));
};


/** @param {?proto.io.nevill.boardwalk.Section|undefined} value */
proto.io.nevill.boardwalk.ConsoleContents.prototype.setSection = function(value) {
  jspb.Message.setOneofWrapperField(this, 4, proto.io.nevill.boardwalk.ConsoleContents.oneofGroups_[0], value);
};


proto.io.nevill.boardwalk.ConsoleContents.prototype.clearSection = function() {
  this.setSection(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.io.nevill.boardwalk.ConsoleContents.prototype.hasSection = function() {
  return jspb.Message.getField(this, 4) != null;
};


