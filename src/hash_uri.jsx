import _ from 'underscore';
import Plottable from 'plottable';

function ParseHashURI(hash) {
  var hashURI = hash;
  if (hash.substr(0, 1) === "#") {
    hashURI = hash.substr(1);
  }
  var qmarkPos = hashURI.indexOf("?");
  if (qmarkPos == -1) {
    return {path: decodeURIComponent(hashURI), params: {}};
  }
  var path = decodeURIComponent(hashURI.substr(0, qmarkPos));
  var paramsParts = hashURI.substr(paramsStart + 1).split("&");
  var params = {};
  for (var i = 0; i < paramsParts.length; i++) {
    var paramStr = paramsParts[i];
    var eqPos = paramStr.indexOf("=");
    var name = paramStr;
    var value = "";
    if (eqPos != -1) {
      name = paramStr.substr(0, eqPos);
      value = paramStr.substr(eqPos + 1);
    }
    name = decodeURIComponent(name);
    value = decodeURIComponent(value);
    if (!_.has(params, name)) {
      params[name] = [];
    }
    params[name].push(value);
  }
  return {path: path, params: params};
}

export default class HashURIStore {
  constructor() {
    this._path = "";
    this._params = {};
    this._callbacks = new Plottable.Utils.CallbackSet();
    this._parseHash = this._parseHash.bind(this);
    window.addEventListener("hashchange", this._parseHash);
    this._parseHash();
  }
  _parseHash() {
    var uri = ParseHashURI(window.location.hash);
    this._path = uri.path;
    this._params = uri.params;
    this._callbacks.callCallbacks(this);
  }
  onUpdate(callback, immediate) {
    this._callbacks.add(callback);
    if (immediate) {
      callback(this);
    }
    return this;
  }
  offUpdate(callback) {
    this._callbacks.delete(callback);
    return this;
  }
  path() {
    return this._path;
  }
  has(name) {
    return _.has(this.params, name);
  }
  first(name) {
    if (!this.has(name)) {
      return;
    }
    return this._params[name][0];
  }
  params(name) {
    if (!this.has(name)) {
      return;
    }
    return this._params[name];
  }
}

