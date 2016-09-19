// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';

export class QueryKey extends React.Component {
  render() {
    const renderItem = (item, index) => {
      const color = this.context.colorScale.scale(item.title);
      const select = () => this.props.onSelectMetric(item.queryIndex, item.metric);
      return (
        <li key={index+"-"+item.title}>
          <a onClick={select}>
            <span style={{color: color}}>&#x25cf;</span>
            <span>{item.title}</span>
            <span>{item.value}</span>
          </a>
        </li>
      );
    };
    return (
      <ul>
        {this.props.series.map(renderItem)}
      </ul>
    );
  }
}
QueryKey.propTypes = {
  series: React.PropTypes.array.isRequired,
};
QueryKey.contextTypes = {
  colorScale: React.PropTypes.object.isRequired,
};
