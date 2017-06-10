import * as _ from 'underscore';
import { UnknownAction } from '../actions';
import { ReceiveConfigAction, RECEIVE_CONFIG } from '../actions/config';
import * as config_types from '../types/config';

export interface GraphQuery {
  title: string;
  query: string;
  source: string;
  match: {[label: string]: string};
  expanded?: ExpandQuery;
}

export interface ExpandQuery {
  title: string;
  query: string;
  source: string;
  labels: {[label: string]: string};
  match: {[label: string]: string};
}

export type State = Map<string, GraphQuery>;

type Actions = ReceiveConfigAction|UnknownAction;

export function reducer(state: State = new Map<string, GraphQuery>(), action: Actions = UnknownAction): State {
  switch (action.type) {
  case RECEIVE_CONFIG:
    action = action as ReceiveConfigAction;
    let queries = new Map<string, GraphQuery>();
    _.each(action.config.consoles, (console: config_types.Console, path: string) => {
      _.each(console.contents, (item: config_types.ConsoleContents, graphIndex: number) => {
        if (!item.graph) {
          return;
        }
        _.each(item.graph.queries, (query: config_types.GraphQuery, queryIndex: number) => {
          queries.set(key(path, graphIndex, queryIndex), {
            title: query.title,
            query: query.query,
            source: query.source,
            match: query.match,
            expanded: !query.expanded ? undefined : {
              title: query.expanded.title,
              query: query.expanded.query,
              source: query.expanded.source,
              labels: query.expanded.labels,
              match: query.match,
            }
          });
        });
      });
    });
    return queries;
  default:
    return state;
  }
}

export function key(consolePath: string, graphIndex: number, queryIndex: number): string {
  return consolePath + '#' + graphIndex + '/' + queryIndex;
}
