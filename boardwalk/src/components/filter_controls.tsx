import { connect } from 'react-redux';
import * as React from 'react';
import * as _ from 'underscore';
import { LabelFilterContainer, Selector } from './label_filter';
import { State } from '../reducers';

interface FilterSelectControlProps {
  selectors: Selector[];
  filter: {[label: string]: string};
  onRemoveFilter: (label: string) => void;
}

function FilterSelectControl(props: FilterSelectControlProps): React.ReactElement<{}> {
  var selectorLabels = props.selectors.map((s: Selector) => s.label);
  var unknown = _.difference(_.keys(props.filter), selectorLabels);
  return (
    <ul>
      {props.selectors.map((selector: Selector): React.ReactElement<{}> => (
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
    selectors: (state.config.config ? state.config.config.consoles[state.console.path].selectors : []),
    filter: state.filter.filters,
  }),
  (dispatch) => ({
    onRemoveFilter: (name) => dispatch({
      type: 'SET_FILTERS',
      filters: {[name]: null},
    }),
  })
)(FilterSelectControl);
