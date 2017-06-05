import { connect } from 'react-redux';
import * as React from 'react';
import * as _ from 'underscore';
import * as query_set from './query_set';
import { LabelSelector } from './label_selector';
import * as filter_actions from '../actions/filter';
import { State } from '../reducers';

export interface SelectorQuery {
  query: string;
  source: string;
  label: string;
  match: {[label: string]: string};
}

export interface SelectorQueryResult {
  metric: {[label: string]: string};
  queryOptions: SelectorQuery;
}

export interface Selector {
  label: string;
  options: string[];
  queries: SelectorQuery[];
}

function get<V, D>(obj: {[key: string]: V | null | undefined}, key: string, def: D): V | D {
  if (!obj.hasOwnProperty(key)) {
    return def;
  }
  let val = obj[key];
  if (val === null || val === undefined) {
    return def;
  }
  return val;
}

interface LabelFilterProps {
  queries: SelectorQuery[];
  label: string;
  options: string[];
  filter: {[label: string]: string};
  onSelect: (label: string, value: string) => void;
}

interface LabelFilterState {
  labels: string[];
}

class FilterSelector extends React.Component<LabelFilterProps, LabelFilterState> {
  constructor(props: LabelFilterProps) {
    super(props);
    console.log('filter queries', props.queries);
    this.state = {
      labels: [],
    };
    this._onData = this._onData.bind(this);
  }
  _labelsFromResults(results: query_set.VectorResult[]): string[] {
    var labels = _.map(results, (result) => (result.metric[this.props.queries[result.queryIndex].label]));
    labels = _.filter(labels, _.identity);
    labels = _.sortBy(labels, _.identity);
    labels = _.uniq(labels, true);
    return labels;
  }
  _onData(results: query_set.VectorResult[]) {
    console.log('got filter label results', results)
    const labels = this._labelsFromResults(results);
    this.setState({
      ...this.state,
      labels,
    });
  }
  render() {
    const select = this.props.onSelect.bind(this, this.props.label);
    const value = get(this.props.filter, this.props.label, '');
    const options = _.union(this.props.options, this.state.labels);
    console.log('rendering filter options', options)
    return (
      <div>
        <query_set.VectorQuerySet queries={this.props.queries} strictMatch={false} onData={this._onData} />
        <LabelSelector value={value} options={options} onSelect={select} />
      </div>
    );
  }
}

interface LabelFilterContainerProps {
  queries: SelectorQuery[];
  label: string;
  options: string[];
}

export const LabelFilterContainer: React.ComponentClass<LabelFilterContainerProps> = connect(
  (state: State) => ({
    filter: state.filter.filters,
  }),
  (dispatch) => ({
    onSelect: (label, value) => dispatch<filter_actions.Action>({
      type: filter_actions.FILTER_CHANGE,
      filters: {[label]: value},
    }),
  }),
  null,
  {pure: false}
)(FilterSelector);
