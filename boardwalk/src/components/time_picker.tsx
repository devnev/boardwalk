import * as moment from 'moment';
import * as React from 'react';

const timeFormat = 'YYYY-MM-DD HH:mm:ssZZ';

function FormatDuration(seconds: number): string {
  const week = 7 * 24 * 60 * 60;
  const day = 24 * 60 * 60;
  const hour = 60 * 60;
  const minute = 60;
  var res = '';
  if (seconds >= week) {
    var weeks = Math.floor(seconds / week);
    res = res + weeks.toString() + 'w';
    seconds = seconds - weeks * week;
  }
  if (seconds >= day) {
    var days = Math.floor(seconds / day);
    res = res + days.toString() + 'd';
    seconds = seconds - days * day;
  }
  if (seconds >= hour) {
    var hours = Math.floor(seconds / hour);
    res = res + hours.toString() + 'h';
    seconds = seconds - hours * hour;
  }
  if (seconds >= minute) {
    var minutes = Math.floor(seconds / minute);
    res = res + minutes.toString() + 'm';
    seconds = seconds - minutes * minute;
  }
  if (seconds > 0) {
    res = res + seconds.toString() + 's';
  }
  return res;
}

function FormatDate(date: Date): string {
  return moment(date).format(timeFormat);
}

interface TimePickerFormProps {
  value: string;
  step: string;
  valid: boolean;
  dirty: boolean;
  onStepBack?: () => void;
  onStepForward?: () => void;
  onChanged?: (value: string) => void;
  onPick?: () => void;
  onPickNow?: () => void;
}

function TimePickerForm(props: TimePickerFormProps): JSX.Element {
  let {value, step, valid, dirty, onStepBack, onStepForward, onChanged, onPick, onPickNow} = props;
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
      <button type="button" onClick={onStepBack}>-{step}</button>
      <input type="text" value={value} onChange={onInputChanged} className={cls} />
      <button type="button" onClick={onStepForward}>+{step}</button>
      <button type="button" onClick={onPickNow}>now</button>
    </form>
  );
}

interface TimePickerProps {
  end: Date;
  step: number;
  onPickEnd: (d: Date) => void;
}

interface TimePickerState {
  value: string;
  valid: boolean;
  dirty: boolean;
}

export class TimePicker extends React.Component<TimePickerProps, TimePickerState> {
  constructor(props: TimePickerProps) {
    super(props);
    this.state = {
      value: FormatDate(props.end),
      valid: true,
      dirty: false,
    };
  }

  _onStepBack() {
    this.props.onPickEnd(new Date(this.props.end.getTime() - this.props.step * 1000));
  }
  _onStepForward() {
    this.props.onPickEnd(new Date(this.props.end.getTime() + this.props.step * 1000));
  }
  _onChanged(value: string) {
    this.setState({
      value: value,
      valid: moment(value).isValid(),
      dirty: true,
    });
  }
  _onPick() {
    if (this.state.valid) {
      this.props.onPickEnd(moment(this.state.value).toDate());
    }
  }
  _onPickNow() {
    this.props.onPickEnd(new Date());
  }

  render(): JSX.Element {
    return (
      <TimePickerForm
        value={this.state.value}
        step={FormatDuration(this.props.step)}
        valid={this.state.valid}
        dirty={this.state.dirty}
        onPick={() => this._onPick()}
        onPickNow={() => this._onPickNow()}
        onStepForward={() => this._onStepForward()}
        onStepBack={() => this._onStepBack()}
        onChanged={(value: string) => this._onChanged(value)}
      />);
  }
}
