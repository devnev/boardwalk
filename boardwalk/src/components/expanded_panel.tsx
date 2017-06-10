import * as React from 'react';
import { connect } from 'react-redux';
import { MetricsPanelContainer as MetricsPanel } from './metrics_panel';

interface ExpandedQuery {
  title: string;
  query: string;
  source: string;
  labels: {[label: string]: string};
  match: {[label: string]: string};
}

interface ExpandedPanelProps {
  query: ExpandedQuery;
  onSelectFilter: (filter: {[label: string]: string}) => void;
}

function ExpanededPanel(props: ExpandedPanelProps): React.ReactElement<{}> {
  const onSelect = (ignoredQueryIndex: number, metricLabels: {[label: string]: string}): void => {
    let filter = {};
    Object.keys(props.query.labels).forEach((labelName) => {
      filter[props.query.labels[labelName]] = metricLabels[labelName];
    });
    props.onSelectFilter(filter);
  };
  return (
    <MetricsPanel
      queries={[props.query]}
      graphHeight="700px"
      onSelectMetric={onSelect}
    />
  );
}

interface ExpandedPanelContainerProps {
  query: ExpandedQuery;
}

export const ExpandedPanelContainer: React.ComponentClass<ExpandedPanelContainerProps> = connect(
  null,
  (dispatch) => ({
    onSelectFilter: (filter: {[label: string]: string}) => dispatch({
      type: 'SET_FILTERS',
      filters: filter
    }),
  })
)(ExpanededPanel);
