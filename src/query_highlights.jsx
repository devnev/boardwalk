// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';

class _QueryHighlights extends React.Component {
  render() {
    return false;
  }
}
_QueryHighlights.propTypes = {
  data: React.PropTypes.array.isRequired,
  onHighlightData: React.PropTypes.func.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
};
export const QueryHighlights = connect(
  (state) => ({
    highlightTime: state.highlight.time,
  })
)(_QueryHighlights);

