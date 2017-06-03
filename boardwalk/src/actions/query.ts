export const SUBSCRIBE_QUERY = 'SUBSCRIBE_QUERY';
export type SUBSCRIBE_QUERY = typeof SUBSCRIBE_QUERY;

export interface SubscribeQueryAction {
  type: SUBSCRIBE_QUERY;
  query: string;
  source: string;
}

export const LOAD_QUERY = 'LOAD_QUERY';
export type LOAD_QUERY = typeof LOAD_QUERY;

export interface QueryRequest {
  cancel: () => void;
}

export interface LoadQueryAction {
  type: LOAD_QUERY;
  query: string;
  source: string;
  request: QueryRequest;
  start: Date;
  end: Date;
}

export const QUERY_DATA = 'QUERY_DATA';
export type QUERY_DATA = typeof QUERY_DATA;

export interface QueryDataAction {
  type: QUERY_DATA;
  query: string;
  source: string;
  request: QueryRequest;
  start: Date;
  end: Date;
  data: any;
}
