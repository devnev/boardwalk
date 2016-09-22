// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import { TimePicker } from './time_picker.jsx';
import { DurationPicker } from './duration_picker.jsx';

export default class RangePicker extends React.Component {
  render() {
    return <div><DurationPicker /><TimePicker /></div>;
  }
}
RangePicker.propTypes = {};
