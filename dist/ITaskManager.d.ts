import { ITask } from './ITask';
export interface ITaskManager {
    push(task: ITask): number;
    execute(): Promise<void>;
    reset(preserveStack?: boolean): boolean;
    stackLength(): number;
    _unwound: boolean;
    _hasError: boolean;
    _finished: boolean;
}
