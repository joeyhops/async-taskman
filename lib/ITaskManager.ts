import { ITask } from './ITask';

export interface ITaskManager {
  push(task: ITask ): number; // Length of current task stack. Also task id.
  execute(): Promise<void>;
  reset(preserveStack?: boolean): boolean;
  stackLength(): number;

  _unwound: boolean;
  _hasError: boolean;
  _finished: boolean;
}