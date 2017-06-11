export type Point = [number, string];
export type MetricLabels = {[label: string]: string};

const PROM_SCALAR = 'scalar';
type PROM_SCALAR = typeof PROM_SCALAR;

export interface PromScalar {
  resultType: typeof PROM_SCALAR;
  result: Point;
}

export function isScalar(data: object): data is PromScalar {
  return (data as PromScalar).resultType === PROM_SCALAR;
}

const PROM_VECTOR = 'vector';
type PROM_VECTOR = typeof PROM_VECTOR;

export interface PromVector {
  resultType: PROM_VECTOR;
  result: {
    metric: MetricLabels;
    value: Point;
  }[];
}

export function isVector(data: object): data is PromVector {
  return (data as PromVector).resultType === PROM_VECTOR;
}

const PROM_MATRIX = 'matrix';
type PROM_MATRIX = typeof PROM_MATRIX;

export interface PromMatrix {
  resultType: typeof PROM_MATRIX;
  result: {
    metric: MetricLabels;
    values: Point[];
  }[];
}

export function isMatrix(data: object): data is PromMatrix {
  return (data as PromMatrix).resultType === PROM_MATRIX;
}
