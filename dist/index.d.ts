import { ITask } from './ITask';
import { ITaskManager } from './ITaskManager';
export default class TaskManager implements ITaskManager {
    protected _taskStack: ITask[];
    private _lastErr;
    private _errOn;
    private _shouldUnwind;
    private _PC;
    _hasError: boolean;
    _unwound: boolean;
    _finished: boolean;
    constructor(unwind: boolean, tasks?: ITask[]);
    push(task: ITask): number;
    execute(): Promise<void>;
    private _execute;
    reset(preserveStack?: boolean): boolean;
    stackLength(): number;
    private _unwind;
    private _holdErr;
}
