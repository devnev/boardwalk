import { connect } from 'react-redux';
import * as React from 'react';
import * as _ from 'underscore';
import { LabelFilterContainer, Selector } from './label_filter';

interface FilterSelectControlProps {
  selectors: Selector[];
  filter: object;
  onRemoveFilter: (label: string) => void;
}

function FilterSelectControl(props: FilterSelectControlProps): JSX.Element {
  var selectorLabels = props.selectors.map((s: Selector) => s.label);
  var unknown = _.difference(_.keys(props.filter), selectorLabels);
  return (
    <ul>
      {props.selectors.map((selector: Selector) => (
        <li key={selector.label}>
          <span>{selector.label}</span>
          <LabelFilterContainer
            queries={selector.queries || []}
            label={selector.label}
            options={selector.options}
          />
        </li>
      ))}
      {unknown.map((label: string) => (
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
  (state) => ({
    selectors: state.config.consoles[state.console].selectors,
    filter: state.filter,
  }),
  (dispatch) => ({
    onRemoveFilter: (name) => dispatch({
      type: 'SET_FILTERS',
      filters: {[name]: null},
    }),
  })
)(FilterSelectControl);
