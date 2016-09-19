// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';

export class QueryKey extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(function(item, index) {
          var caption = item.caption;
          var value = item.value;
          var colorStyle = {color: this.context.colorScale.scale(caption)};
          return (<li key={caption+index}>
            <span style={colorStyle}>&#x25cf;</span>
            <span>{caption}</span>
            <span>{value}</span>
          </li>);
        }.bind(this))}
      </ul>
    );
  }
}
QueryKey.propTypes = {
  items: React.PropTypes.array.isRequired,
};
QueryKey.contextTypes = {
  colorScale: React.PropTypes.object.isRequired,
};
