import { connect } from 'react-redux';
import * as React from 'react';
import axios from 'axios';
import { AxiosPromise, Canceler as AxiosCanceler } from 'axios';

interface LoaderProps {
  loaded: boolean;
  onConfigLoaded: (data: {}) => void;
}

class Loader extends React.Component<LoaderProps, {}> {
  req?: AxiosPromise;
  cancel?: AxiosCanceler;
  componentDidMount() {
    const cancel = axios.CancelToken.source();
    this.req = axios.get('config.json', {cancelToken: cancel.token});
    this.req.then((response) => this.props.onConfigLoaded(response.data));
    this.cancel = cancel.cancel;
  }
  componentWillUnmount() {
    if (this.req) {
      if (this.cancel) {
        this.cancel();
        this.cancel = undefined;
      }
      this.req = undefined;
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
  (state) => ({
    loaded: !!state.config,
  }),
  (dispatch) => ({
    onConfigLoaded: (config) => dispatch({
      type: 'RECEIVE_CONFIG',
      config: config,
    }),
    onInitialize: (range) => dispatch({
      type: 'INITIALIZE',
      range: range,
    }),
  })
)(Loader);
