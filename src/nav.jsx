// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import _ from 'underscore';

export function ConsoleTree(consoles) {
  var root = {console: null, children: {}, path: ""};
  _.each(consoles, function(console, path) {
    var parts = path.replace(/\/+/g, "/").replace(/\/$/, "").replace(/^\//, "").split("/");
    if (parts[0] === "") {
      root.console = console;
      return;
    }
    var current = root;
    for (let i = 0; i < parts.length; i++) {
      if (!_.has(current.children, parts[i])) {
        current.children[parts[i]] = {console: null, children: {}};
      }
      current = current.children[parts[i]];
    }
    current.console = console;
    current.path = path;
  });
  return root;
}

class _ConsoleNav extends React.Component {
  render() {
    var root = ConsoleTree(this.props.consoles);
    var rootNode;
    if (root.console) {
      rootNode = <NodeLink node={root} />;
    }
    return (
      <nav>
        {rootNode}
        <NavNodeList nodes={root.children} />
      </nav>
    );
  }
}
_ConsoleNav.propTypes = {
  consoles: React.PropTypes.object.isRequired,
};
export const ConsoleNav = connect(
  (state) => ({
    consoles: state.config.consoles
  })
)(_ConsoleNav);
export { ConsoleNav as default };

class NavNodeList extends React.Component {
  render() {
    if (_.isEmpty(this.props.nodes)) {
      return false;
    }
    return (
      <ul>
        {_.map(this.props.nodes, function(node, name) {
          return <li key={name}><NavNode node={node} /></li>;
        }.bind(this))}
      </ul>
    );
  }
}
NavNodeList.propTypes = {
  nodes: React.PropTypes.object.isRequired,
};

class NavNode extends React.Component {
  render() {
    return (
      <div>
        <NodeLink node={this.props.node} />
        <NavNodeList nodes={this.props.node.children} />
      </div>
    );
  }
}
NavNode.propTypes = {
  node: React.PropTypes.object.isRequired,
};

class _NodeLink extends React.Component {
  render() {
    return <a onClick={() => this.props.onSwitch(this.props.node.path)}>{this.props.node.console.title}</a>;
  }
}
_NodeLink.propTypes = {
  node: React.PropTypes.object.isRequired,
  onSwitch: React.PropTypes.func.isRequired,
};
const NodeLink = connect(
  () => ({}),
  (dispatch) => ({
    onSwitch: (console) => dispatch({
      type: 'SELECT_CONSOLE',
      console: console,
    }),
  })
)(_NodeLink);
