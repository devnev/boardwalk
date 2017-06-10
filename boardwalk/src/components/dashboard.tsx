// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as React from 'react';
import { LoaderContainer } from './config_loader';
import { DashboardRangePicker as RangePicker } from './range_picker';
import { FilterSelectControlContainer as FilterSelectControl } from './filter_controls';
import { Section } from './section';
import { DashboardNav as ConsoleNav } from './console_nav';
import { ScaleProvider } from './scale_context';
import { GraphPanelContainer as GraphPanel } from './graph_panel';
import { State as RangeState } from '../reducers/range';
import { State as ConsolesState } from '../reducers/consoles';
import { State as ConsolePathState } from '../reducers/console_path';
import { State } from '../reducers';
import * as config_types from '../types/config';

interface DashboardProps {
  range: RangeState;
}

class Dashboard extends React.Component<DashboardProps, {}> {
  render(): React.ReactElement<{}> | null {
    if (!this.props.range.duration || !this.props.range.end) {
      return null;
    }
    return (
      <LoaderContainer>
        <ConsoleNav />
        <ConsolePageContainer />
      </LoaderContainer>
    );
  }
}

export const DashboardContainer: React.ComponentClass<{}> = connect(
  (state: State): DashboardProps => ({
    range: state.range,
  }),
)(Dashboard);

interface ConsolePageProps {
  consolePath: ConsolePathState;
  consoles: ConsolesState;
}

function ConsolePage(props: ConsolePageProps): React.ReactElement<{}> {
  const config = props.consoles.get(props.consolePath);
  const title = config ? config.title : 'Console Not Found';
  const console = config ? <Console path={props.consolePath} contents={config.contents} /> : null;
  return (
    <div>
      <h1>{title}</h1>
      <ScaleProvider>
        <div>
          <RangePicker />
          <FilterSelectControl />
          {console}
        </div>
      </ScaleProvider>
    </div>
  );
}

const ConsolePageContainer: React.ComponentClass<{}> = connect(
  (state: State): ConsolePageProps => ({
    consolePath: state.consolePath,
    consoles: state.consoles,
  })
)(ConsolePage);

interface ConsoleProps {
  path: string;
  contents: config_types.ConsoleContents[];
}

class Console extends React.Component<ConsoleProps, {}> {
  _renderItem(index: number): React.ReactElement<{}> | null {
    let item = this.props.contents[index];
    if (item.graph) {
      return (
        <GraphPanel
          key={index}
          consolePath={this.props.path}
          index={index}
        />
      );
    } else if (item.section) {
      return (
        <Section
          key={index}
          title={item.section.title}
          links={item.section.links}
        />
      );
    } else {
      return null;
    }
  }
  render(): React.ReactElement<{}> {
    return (
      <div>
        {this.props.contents.map((item, index) => this._renderItem(index))}
      </div>
    );
  }
}
