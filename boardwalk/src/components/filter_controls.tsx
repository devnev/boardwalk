import { connect } from 'react-redux';
import * as React from 'react';
import * as _ from 'underscore';
import { LabelFilterContainer, Selector } from './label_filter';
import { State } from '../reducers';
import * as config_types from '../types/config';

interface FilterSelectControlProps {
  consolePath: string;
  consoles: Map<string, config_types.Console>;
  filter: {[label: string]: string};
  onRemoveFilter: (label: string) => void;
}

function FilterSelectControl(props: FilterSelectControlProps): React.ReactElement<{}> {
  const console = props.consoles.get(props.consolePath);
  const selectors = console ? console.selectors : [];
  var selectorLabels = selectors.map((s: Selector) => s.label);
  var unknown = _.difference(_.keys(props.filter), selectorLabels);
  return (
    <ul>
      {selectors.map((selector: Selector): React.ReactElement<{}> => (
        <li key={selector.label}>
          <span>{selector.label}</span>
          <LabelFilterContainer
            queries={selector.queries || []}
            label={selector.label}
            options={selector.options}
          />
        </li>
      ))}
      {unknown.map((label: string): React.ReactElement<{}> => (
        <li key={label}>
          <span>{label}</span>
          <span>{props.filter[label]}</span>
          <button type="button" onClick={() => props.onRemoveFilter(label)}>X</button>
        </li>
      ))}
    </ul>
  );
}

export const FilterSelectControlContainer: React.ComponentClass<{}> = connect(
  (state: State) => ({
    consolePath: state.consolePath,
    consoles: state.consoles,
    filter: state.filter.filters,
  }),
  (dispatch) => ({
    onRemoveFilter: (name) => dispatch({
      type: 'SET_FILTERS',
      filters: {[name]: null},
    }),
  })
)(FilterSelectControl);
