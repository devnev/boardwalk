import { connect } from 'react-redux';
import * as React from 'react';
import * as config_actions from '../actions/config';
import { State } from '../reducers';

interface LoaderProps {
  loaded: boolean;
  onLoadConfig: () => void;
}

class Loader extends React.Component<LoaderProps, {}> {
  componentDidMount() {
    if (!this.props.loaded) {
      this.props.onLoadConfig();
    }
  }
  render() {
    if (!this.props.loaded) {
      return <p>Loading config...</p>;
    }
    return <div>{this.props.children}</div>;
  }
}

export const LoaderContainer: React.ComponentClass<{}> = connect(
  (state: State) => ({
    loaded: !!state.config.config,
  }),
  (dispatch) => ({
    onLoadConfig: () => dispatch<config_actions.LoadConfigAction>(config_actions.loadConfig('config.json')),
  })
)(Loader);
