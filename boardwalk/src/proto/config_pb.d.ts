// package: io.nevill.boardwalk
// file: src/proto/config.proto

import * as jspb from "google-protobuf";

export class Config extends jspb.Message {
  getConsolesMap(): jspb.Map<string, Console>;
  clearConsolesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Config.AsObject;
  static toObject(includeInstance: boolean, msg: Config): Config.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Config, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Config;
  static deserializeBinaryFromReader(message: Config, reader: jspb.BinaryReader): Config;
}

export namespace Config {
  export type AsObject = {
    consolesMap: Array<[string, Console.AsObject]>,
  }
}

export class Console extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  clearSelectorsList(): void;
  getSelectorsList(): Array<Selector>;
  setSelectorsList(value: Array<Selector>): void;
  addSelectors(value?: Selector, index?: number): Selector;

  clearContentsList(): void;
  getContentsList(): Array<ConsoleContents>;
  setContentsList(value: Array<ConsoleContents>): void;
  addContents(value?: ConsoleContents, index?: number): ConsoleContents;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Console.AsObject;
  static toObject(includeInstance: boolean, msg: Console): Console.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Console, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Console;
  static deserializeBinaryFromReader(message: Console, reader: jspb.BinaryReader): Console;
}

export namespace Console {
  export type AsObject = {
    title: string,
    selectorsList: Array<Selector.AsObject>,
    contentsList: Array<ConsoleContents.AsObject>,
  }
}

export class ConsoleContents extends jspb.Message {
  hasGraph(): boolean;
  clearGraph(): void;
  getGraph(): Graph | undefined;
  setGraph(value?: Graph): void;

  hasSection(): boolean;
  clearSection(): void;
  getSection(): Section | undefined;
  setSection(value?: Section): void;

  getPanelsCase(): ConsoleContents.PanelsCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConsoleContents.AsObject;
  static toObject(includeInstance: boolean, msg: ConsoleContents): ConsoleContents.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConsoleContents, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConsoleContents;
  static deserializeBinaryFromReader(message: ConsoleContents, reader: jspb.BinaryReader): ConsoleContents;
}

export namespace ConsoleContents {
  export type AsObject = {
    graph?: Graph.AsObject,
    section?: Section.AsObject,
  }

  export enum PanelsCase {
    PANELS_NOT_SET = 0,
    GRAPH = 3,
    SECTION = 4,
  }
}

export class Selector extends jspb.Message {
  getLabel(): string;
  setLabel(value: string): void;

  clearOptionsList(): void;
  getOptionsList(): Array<string>;
  setOptionsList(value: Array<string>): void;
  addOptions(value: string, index?: number): string;

  clearQueriesList(): void;
  getQueriesList(): Array<SelectorQuery>;
  setQueriesList(value: Array<SelectorQuery>): void;
  addQueries(value?: SelectorQuery, index?: number): SelectorQuery;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Selector.AsObject;
  static toObject(includeInstance: boolean, msg: Selector): Selector.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Selector, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Selector;
  static deserializeBinaryFromReader(message: Selector, reader: jspb.BinaryReader): Selector;
}

export namespace Selector {
  export type AsObject = {
    label: string,
    optionsList: Array<string>,
    queriesList: Array<SelectorQuery.AsObject>,
  }
}

export class SelectorQuery extends jspb.Message {
  getQuery(): string;
  setQuery(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  getMatchMap(): jspb.Map<string, string>;
  clearMatchMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorQuery.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorQuery): SelectorQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorQuery;
  static deserializeBinaryFromReader(message: SelectorQuery, reader: jspb.BinaryReader): SelectorQuery;
}

export namespace SelectorQuery {
  export type AsObject = {
    query: string,
    source: string,
    label: string,
    matchMap: Array<[string, string]>,
  }
}

export class Section extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  clearLinksList(): void;
  getLinksList(): Array<Link>;
  setLinksList(value: Array<Link>): void;
  addLinks(value?: Link, index?: number): Link;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Section.AsObject;
  static toObject(includeInstance: boolean, msg: Section): Section.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Section, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Section;
  static deserializeBinaryFromReader(message: Section, reader: jspb.BinaryReader): Section;
}

export namespace Section {
  export type AsObject = {
    title: string,
    linksList: Array<Link.AsObject>,
  }
}

export class Link extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  getText(): string;
  setText(value: string): void;

  getMatchMap(): jspb.Map<string, string>;
  clearMatchMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Link.AsObject;
  static toObject(includeInstance: boolean, msg: Link): Link.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Link, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Link;
  static deserializeBinaryFromReader(message: Link, reader: jspb.BinaryReader): Link;
}

export namespace Link {
  export type AsObject = {
    url: string,
    text: string,
    matchMap: Array<[string, string]>,
  }
}

export class Graph extends jspb.Message {
  clearQueriesList(): void;
  getQueriesList(): Array<GraphQuery>;
  setQueriesList(value: Array<GraphQuery>): void;
  addQueries(value?: GraphQuery, index?: number): GraphQuery;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Graph.AsObject;
  static toObject(includeInstance: boolean, msg: Graph): Graph.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Graph, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Graph;
  static deserializeBinaryFromReader(message: Graph, reader: jspb.BinaryReader): Graph;
}

export namespace Graph {
  export type AsObject = {
    queriesList: Array<GraphQuery.AsObject>,
  }
}

export class GraphQuery extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getMatchMap(): jspb.Map<string, string>;
  clearMatchMap(): void;
  hasExpanded(): boolean;
  clearExpanded(): void;
  getExpanded(): SelectorGraph | undefined;
  setExpanded(value?: SelectorGraph): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphQuery.AsObject;
  static toObject(includeInstance: boolean, msg: GraphQuery): GraphQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphQuery;
  static deserializeBinaryFromReader(message: GraphQuery, reader: jspb.BinaryReader): GraphQuery;
}

export namespace GraphQuery {
  export type AsObject = {
    title: string,
    query: string,
    source: string,
    matchMap: Array<[string, string]>,
    expanded?: SelectorGraph.AsObject,
  }
}

export class SelectorGraph extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getLabelsMap(): jspb.Map<string, string>;
  clearLabelsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorGraph.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorGraph): SelectorGraph.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorGraph, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorGraph;
  static deserializeBinaryFromReader(message: SelectorGraph, reader: jspb.BinaryReader): SelectorGraph;
}

export namespace SelectorGraph {
  export type AsObject = {
    title: string,
    query: string,
    source: string,
    labelsMap: Array<[string, string]>,
  }
}

