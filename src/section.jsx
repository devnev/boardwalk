// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import { FormatTemplate, MatchFilter } from './utils.jsx';
import { Filter } from './dispatch.jsx';

export default class Section extends React.Component {
  render() {
    return (
      <div>
        <h2>{this.props.title}</h2>
        <LinksList links={this.props.links} />
      </div>
    );
  }
}
Section.propTypes = {
  title: React.PropTypes.string.isRequired,
  links: React.PropTypes.array.isRequired,
};

class LinksList extends React.Component {
  render() {
    return (
      <ul>
        {this.props.links.map(function(link, index) {
          return <Link key={index} match={link.match} url={link.url} text={link.text} />;
        }.bind(this))}
      </ul>
    );
  }
}
LinksList.propTypes = {
  links: React.PropTypes.array.isRequired,
};

class Link extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._update = this._update.bind(this);
  }
  componentWillMount() {
    Filter.onUpdate(this._update);
  }
  componentWillUnmount() {
    Filter.offUpdate(this._update);
  }
  _update() {
    this.setState({});
  }
  render() {
    if (!MatchFilter(this.props.match, Filter.filter())) {
      return false;
    }
    var url = FormatTemplate(this.props.url, Filter.filter());
    var text = FormatTemplate(this.props.text, Filter.filter());
    return <li><a href={url}>{text}</a></li>;
  }
}
Link.propTypes = {
  match: React.PropTypes.object,
  url: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired,
};
