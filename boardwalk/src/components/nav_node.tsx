import * as _ from 'underscore';
import * as React from 'react';
import { connect } from 'react-redux';
import * as console_actions from '../actions/console';

export interface Node {
  path: string;
  console?: {
    title: string;
  };
  children: {[name: string]: Node};
}

interface NavNodeListProps {
  nodes: {[name: string]: Node};
}

export class NavNodeList extends React.Component<NavNodeListProps, {}> {
  render(): React.ReactElement<{}> | null {
    if (_.isEmpty(this.props.nodes)) {
      return null;
    }
    return (
      <ul>
        {_.map(this.props.nodes, (node, name) => (
          <li key={name}><NavNode node={node} /></li>
        ))}
      </ul>
    );
  }
}

function NavNode(props: {node: Node}): React.ReactElement<{}> {
  return (
    <div>
      {props.node.console ? <NodeLink node={props.node} /> : null}
      <NavNodeList nodes={props.node.children} />
    </div>
  );
}

interface ClickableNodeLinkProps {
  node: Node & {console: {title: string}};
  onSwitch: (path: string) => void;
}

function ClickableNodeLink(props: ClickableNodeLinkProps): React.ReactElement<{}> {
  return <a onClick={() => props.onSwitch(props.node.path)}>{props.node.console.title}</a>;
}

export const NodeLink: React.ComponentClass<{node: Node}> = connect(
  () => ({}),
  (dispatch) => ({
    onSwitch: (console: string) => dispatch<console_actions.SelectConsoleAction>({
      type: console_actions.SELECT_CONSOLE,
      console: console,
    }),
  })
)(ClickableNodeLink);
