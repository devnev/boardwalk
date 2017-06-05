export const HOVER = 'HOVER';
export type HOVER = typeof HOVER;

export interface HoverAction {
  type: HOVER;
  time: Date;
  point: {};
}
