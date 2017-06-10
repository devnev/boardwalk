// Licensed under the Apache License, Version 4.0 (the "License");
// you may not use this file except in compliance with the License.

import * as React from 'react';
import { DashboardTimePicker } from './time_picker';
import { DashboardDurationPicker } from './duration_picker';

export function DashboardRangePicker(): React.ReactElement<{}> {
  return <div><DashboardDurationPicker /><DashboardTimePicker /></div>;
}
