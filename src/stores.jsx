// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import HashURIStore from './hash_uri.jsx';
import TimeScaleStore from './time_scale.jsx';

var hashURI = new HashURIStore();
var timeScale = new TimeScaleStore();
hashURI.onUpdate(function() {
  var duration = timeScale.range().duration;
  if (/^\d+$/.test(hashURI.first('duration'))) {
    duration = Number(hashURI.first('duration'));
  }
  var end = timeScale.range().end;
  if (/^\d+$/.test(hashURI.first('end'))) {
    end = new Date(Number(hashURI.first('end')*1000));
  }
  console.log("setting time scale to", {duration: duration, end: end});
  timeScale.range({duration: duration, end: end});
}, true);
timeScale.onUpdate(function() {
  var uri = hashURI.formatWith({
    duration: timeScale.range().duration,
    end: Math.round(timeScale.range().end.getTime()/1000),
  });
});
window.addEventListener("hashchange", hashURI.parseHash);

export { hashURI as HashURI };
export { timeScale as TimeScale };
export function PickDuration(duration) {
  var uri = hashURI.formatWith({duration: duration});
  window.location.hash = '#' + uri;
}
export function PickEnd(end) {
  var uri = hashURI.formatWith({end: Math.floor(end.getTime()/1000)});
  window.location.hash = '#' + uri;
}
