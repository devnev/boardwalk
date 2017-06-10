import * as React from 'react';
// import { StrictMatchFilter, MatchFilter } from '../match';
// import { FormatTemplate, FormatMetric } from '../fmt';
import * as _ from 'underscore';
// import { connect } from 'react-redux';
// import { State } from '../reducers';
// import { State as QueryDataState } from '../reducers/query_data';
// import * as query_actions from '../actions/query';
import { Query, QueryContainer } from './query_puller';
import * as prom from './prom';

// function formatResults(options: QueryOptions, results: {}): QueryResult[] {
//   return results.map((result) => {
//     var title = (
//       options.title ?
//         FormatTemplate(options.title, result.metric) :
//         FormatMetric(result.metric)
//     );
//     return {data: result, title, queryOptions: options, queryIndex: -1};
//   });
// }

type Result<Row> = Row & {
  queryIndex: number;
};

interface BaseProps<Row> {
  queries: Query[];
  strictMatch: boolean;
  onData?: (results: Result<Row>[]) => void;
  children?: React.ReactElement<{results: Result<Row>[]}>[];
}

abstract class BaseQuerySet<
    Row extends object,
    RawResult extends {result: Row[]}
> extends React.Component<BaseProps<Row>, {results: Result<Row>[][], flatResults: Result<Row>[]}> {
  abstract _onUnknownData(queryIndex: number, rawResults: object): void;
  constructor(props: BaseProps<Row>) {
    super(props);
    this.state = {
      results: new Array<Result<Row>[]>(props.queries.length),
      flatResults: new Array<Result<Row>>(),
    };
  }
  componentWillReceiveProps(nextProps: BaseProps<Row>) {
    if (this.props.queries !== nextProps.queries) {
      this.setState({results: new Array(nextProps.queries.length)});
    }
  }
  _onRawData(queryIndex: number, rawResults: RawResult) {
    if (rawResults.result.length === 0 && !this.state.results[queryIndex]) {
      return;
    }
    const rowResults = _.map(
      rawResults.result,
      (result: Row): Result<Row> => (Object.assign({}, result, {queryIndex}))
    );
    const results = this.state.results;
    results[queryIndex] = rowResults;
    const flatResults = _.flatten(this.state.results, true).filter(_.identity);
    if (this.props.onData) {
      this.props.onData(_.flatten(this.state.results, true).filter(_.identity));
    }
    this.setState({
      results: results,
      flatResults: flatResults,
    });
  }
  renderChildren() {
    return React.Children.map(this.props.children, (child: React.ReactElement<{results: Result<Row>[]}>) => {
      return React.cloneElement(child, {
        results: this.state.flatResults,
      });
    });
  }
  render(): JSX.Element {
    const queries = this.props.queries.map((opts: Query, index: number): JSX.Element => (
      <QueryContainer
        key={index}
        options={opts}
        strictMatch={this.props.strictMatch}
        updated={this._onUnknownData.bind(this, index)}
      />
    ));
    return (
      <div>
        {queries}
        {this.props.children && this.state.flatResults.length > 0 ? this.renderChildren() : null}
      </div>
    );
  }
}

interface VectorRow {
  metric: prom.MetricLabels;
  value: prom.Point;
}

export type VectorResult = Result<VectorRow>;

export class VectorQuerySet extends BaseQuerySet<VectorRow, prom.PromVector> {
  _onUnknownData(queryIndex: number, rawResults: object): void {
    if (!prom.isVector(rawResults)) {
      console.warn('expected prom vector, got', rawResults);
      return;
    }
    this._onRawData(queryIndex, rawResults);
  }
}

interface MatrixRow {
  metric: prom.MetricLabels;
  values: prom.Point[];
}

export type MatrixResult = Result<MatrixRow>;

export class MatrixQuerySet extends BaseQuerySet<MatrixRow, prom.PromMatrix> {
  _onUnknownData(queryIndex: number, rawResults: object): void {
    if (!prom.isMatrix(rawResults)) {
      console.warn('expected prom matrix, got', rawResults);
      return;
    }
    this._onRawData(queryIndex, rawResults);
  }
}
