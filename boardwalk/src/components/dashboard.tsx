// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as React from 'react';
import { LoaderContainer } from './config_loader';
import { DashboardRangePicker as RangePicker } from './range_picker';
import { FilterSelectControlContainer as FilterSelectControl } from './filter_controls';
import { Section, Link } from './section';
import { DashboardNav as ConsoleNav } from './console_nav';
import { ScaleProvider } from './scale_context';
import { GraphPanelContainer as GraphPanel, GraphQuery } from './graph_panel';
import { State as RangeState } from '../reducers/range';

interface DashboardProps {
  range: RangeState;
}

class Dashboard extends React.Component<DashboardProps, {}> {
  render(): JSX.Element | null {
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
  (state) => ({
    range: state.range,
  }),
)(Dashboard);

interface ConsolePageProps {
  console: string;
  config?: {
    title: string;
  };
}

function ConsolePage(props: ConsolePageProps): JSX.Element {
  const config = props.config;
  const title = config ? config.title : 'Console Not Found';
  const console = config ? <ConsoleContainer /> : null;
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
  (state) => ({
    console: state.console,
    config: state.config.consoles[state.console],
  })
)(ConsolePage);

interface ConsoleItem {
  graph?: {
    queries: GraphQuery[];
  };
  section?: {
    title: string;
    links: Link[];
  };
}

class Console extends React.Component<{contents: ConsoleItem[]}, {}> {
  _renderItem(index: number): JSX.Element | null {
    let item = this.props.contents[index];
    if (item.graph) {
      return (
        <GraphPanel
          key={index}
          index={index}
          graph={item.graph}
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
  render(): JSX.Element {
    return (
      <div>
        {this.props.contents.map((item, index) => this._renderItem(index))}
      </div>
    );
  }
}

const ConsoleContainer: React.ComponentClass<{}> = connect(
  (state) => ({
    contents: state.config.consoles[state.console].contents,
  })
)(Console);
