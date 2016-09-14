// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import { FormatTemplate, MatchFilter } from './utils.jsx';

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

class _Link extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    if (!MatchFilter(this.props.match, this.props.filter)) {
      return false;
    }
    var url = FormatTemplate(this.props.url, this.props.filter);
    var text = FormatTemplate(this.props.text, this.props.filter);
    return <li><a href={url}>{text}</a></li>;
  }
}
_Link.propTypes = {
  match: React.PropTypes.object,
  url: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired,
  filter: React.PropTypes.object.isRequired,
};
const Link = connect(
  (state) => ({
    filter: state.filter,
  })
)(_Link);
