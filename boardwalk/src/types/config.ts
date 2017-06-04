export interface Config {
  consoles: {[path: string]: Console};
}

export interface Console {
  title: string;
  selectors: Selector[];
  contents: ConsoleContents[];
}

export interface ConsoleContents {
  graph?: Graph;
  section?: Section;
}

export interface Selector {
  label: string;
  options: string[];
  queries: SelectorQuery[];
}

export interface SelectorQuery {
  query: string;
  source: string;
  label: string;
  match: {[label: string]: string};
}

export interface Section {
  title: string;
  links: Link[];
}

export interface Link {
  url: string;
  text: string;
  match: {[label: string]: string};
}

export interface Graph {
  queries: GraphQuery[];
}

export interface GraphQuery {
  title: string;
  query: string;
  source: string;
  match: {[label: string]: string};
  expanded: SelectorGraph;
}

export interface SelectorGraph {
  title: string;
  query: string;
  source: string;
  labels: {[label: string]: string};
}
