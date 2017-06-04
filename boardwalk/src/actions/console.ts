export const SELECT_CONSOLE = 'SELECT_CONSOLE';
export type SELECT_CONSOLE = typeof SELECT_CONSOLE;

export interface SelectConsoleAction {
  type: SELECT_CONSOLE;
  console: string;
}
