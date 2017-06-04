
export interface Metadata {
  title: string;
  metric: {[label: string]: string};
  queryIndex: number;
}

export interface Point {
    t: Date;
    y: number;
}

export type SeriesHighlight = Metadata & Point

export type SeriesValue = Metadata & {
    value: string|number;
}
