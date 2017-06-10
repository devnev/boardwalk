// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as React from 'react';
import * as _ from 'underscore';
import { Node, NodeLink, NavNodeList } from './nav_node';

interface Console {
  title: string;
}

function ConsoleTree(consoles: {[path: string]: Console}): Node {
  let root: Node = {children: {}, path: ''};
  _.each(consoles, function(console: Console, path: string) {
    path = path.replace(/\/+/g, '/').replace(/\/$/, '').replace(/^\//, '');
    var parts = path.split('/');
    if (parts[0] === '') {
      root.console = console;
      return;
    }
    var current = root;
    for (let i = 0; i < parts.length; i++) {
      if (!_.has(current.children, parts[i])) {
        current.children[parts[i]] = {
          children: {},
          path: parts.slice(0, i).join('/'),
        };
      }
      current = current.children[parts[i]];
    }
    current.console = console;
    current.path = path;
  });
  return root;
}

function ConsoleNav(props: {consoles: {[path: string]: Console}}): React.ReactElement<{}> {
  var root = ConsoleTree(props.consoles);
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

export const DashboardNav: React.ComponentClass<{}> = connect(
  (state) => ({
    consoles: state.config.consoles
  })
)(ConsoleNav);
