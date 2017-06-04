import * as React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { FormatDuration, ParseDuration } from '../fmt';
import { State } from '../reducers';
import * as time from '../actions/time';

const strSteps = [
  '10s', '30s', '1m', '5m', '15m', '30m',
  '1h', '3h', '6h', '12h', '1d', '3d',
  '1w', '2w', '4w', '12w', '53w',
];
const steps = strSteps.map(ParseDuration);

interface DurationPickerFormProps {
  value: string;
  valid: boolean;
  dirty: boolean;
  onDecrease?: () => void;
  onIncrease?: () => void;
  onChanged?: (value: string) => void;
  onPick?: () => void;
}

function DurationPickerForm(props: DurationPickerFormProps): JSX.Element {
  const {value, valid, dirty, onDecrease, onIncrease, onChanged, onPick} = props;
  const cls = (valid ? 'valid' : 'error') + (dirty ? ' dirty' : '');
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (onPick) {
      onPick();
    }
  };
  const onInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChanged) {
      onChanged(event.target.value);
    }
  };
  return (
    <form action="" onSubmit={onSubmit}>
      <button type="button" onClick={onDecrease}>&#8722;</button>
      <input type="text" value={value} onChange={onInputChanged} className={cls} />
      <button type="button" onClick={onIncrease}>+</button>
    </form>
  );
}

interface DurationPickerProps {
  duration: number;
  onPickDuration: (duration: number) => void;
}

interface DurationPickerState {
  value: string;
  valid: boolean;
  dirty: boolean;
}

export class DurationPicker extends React.Component<DurationPickerProps, DurationPickerState> {
  constructor(props: DurationPickerProps) {
    super(props);
    this.state = {
      value: FormatDuration(props.duration),
      valid: true,
      dirty: false,
    };
  }

  _onIncrease() {
    for (var i = 0; i < steps.length; i++) {
      if (steps[i] > this.props.duration) {
        this.props.onPickDuration(steps[i]);
        return;
      }
    }
    this.props.onPickDuration(this.props.duration * 2);
  }
  _onDecrease() {
    for (var i = steps.length; i > 0; i--) {
      if (steps[i - 1] < this.props.duration) {
        this.props.onPickDuration(steps[i - 1]);
        return;
      }
    }
  }
  _onChanged(value: string) {
    const duration = ParseDuration(this.state.value);
    this.setState({
      value: value,
      dirty: true,
      valid: duration > 0,
    });
  }
  _onPick() {
    const duration = ParseDuration(this.state.value);
    if (duration > 0) {
      this.props.onPickDuration(duration);
    }
  }

  render(): JSX.Element {
    return (
      <DurationPickerForm
        value={this.state.value}
        valid={this.state.valid}
        dirty={this.state.dirty}
        onIncrease={() => this._onIncrease()}
        onDecrease={() => this._onDecrease()}
        onChanged={(value: string) => this._onChanged(value)}
        onPick={() => this._onPick()}
      />
    );
  }
}

export const DashboardDurationPicker: React.ComponentClass<{}> = connect<{}, {}, DurationPickerProps>(
  (state: State) => ({
    end: state.range.end,
    step: state.range.duration,
  }),
  (dispatch: redux.Dispatch<State>) => ({
    onPickDuration: (duration: number) => dispatch({
      type: time.PICK_DURATION,
      duration: duration,
    }),
  })
)(DurationPicker);
