import * as _ from 'underscore';
import * as React from 'react';

interface LabelSelectorProps {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

export function LabelSelector(props: LabelSelectorProps): JSX.Element {
  const select = (event: React.ChangeEvent<HTMLSelectElement>) => props.onSelect(event.target.value);

  let options = props.options;
  if (!_(options).contains(props.value)) {
    options = [props.value].concat(options);
  }
  if (!_(options).contains('')) {
    options = [''].concat(options);
  }

  return (
    <select value={props.value} onChange={select}>
      {options.map((option: string) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}
