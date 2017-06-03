export const MODIFY_TIME_SCALE = 'MODIFY_TIME_SCALE';
export type MODIFY_TIME_SCALE = typeof MODIFY_TIME_SCALE;

export interface ModifyTimeScaleAction {
  type: MODIFY_TIME_SCALE;
  start: Date;
  end: Date;
}

export const PICK_DURATION = 'PICK_DURATION';
export type PICK_DURATION = typeof PICK_DURATION;

export interface PickDurationAction {
  type: PICK_DURATION;
  duration: number;
}

export const PICK_END = 'PICK_END';
export type PICK_END = typeof PICK_END;

export interface PickEndAction {
  type: PICK_END;
  end: Date;
}
