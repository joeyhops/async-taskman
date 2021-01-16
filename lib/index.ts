import { ITask } from './ITask';
import { ITaskManager } from './ITaskManager';

export default class TaskManager implements ITaskManager {
  protected _taskStack: ITask[] = [];
  private _lastErr: any = null;
  private _errOn: number = null;
  private _shouldUnwind: boolean;
  private _PC: number = 0;
  
  public _hasError: boolean = false;
  public _unwound: boolean = false;
  public _finished: boolean = false;
  

  constructor(unwind: boolean, tasks: ITask[] = null) {
    if (tasks && tasks.length > 0) {
      const taskLen: number = tasks.length;
      for (let i = 0; i < taskLen; i++) {
        this._taskStack.push(tasks[i]);
      }
    }

    this._shouldUnwind = unwind;
  }

  public push(task: ITask): number {
    return this._taskStack.push(task);
  }

  public execute(): Promise<void> {
    return this._execute().catch(err => {
      this._holdErr(err, this._PC);
      console.log(err);
    });
  }

  private async _execute(): Promise<void> {
    if (this._taskStack.length > 0 && !this._hasError) {
      for(;;) {
        const currentTask: ITask = this._taskStack[this._PC];
        const { runnable, onFail } = currentTask;
        if (runnable !== null && onFail !== null) {
          try {
            console.log("Trying runnable.");
            await runnable;
            if (this._taskStack.length > this._PC + 1) {
              this._PC++;
              continue;
            } else break;
          } 
          catch (err) {
            console.log("Caught");
            this._holdErr(err, this._PC);
            if (this._shouldUnwind) {
              await this._unwind();
            } else {
              const curTask: ITask = this._taskStack[this._errOn];
              const { onFail } = curTask;
              await onFail(err, this._errOn);
            }
            break;
          }
        }
      }

      this._finished = true;
      return;
    }
  }

  public reset(preserveStack?: boolean): boolean {
    this._unwound = false;
    this._lastErr = null;
    this._hasError = false;
    this._finished = false;
    this._errOn = null;
    if (preserveStack) return true;
    this._taskStack = [];
  }

  public stackLength(): number {
    return this._taskStack.length;
  }

  private async _unwind(): Promise<void> {
    const taskPointer: number = this._errOn;
    for (let i = taskPointer; i >= 0; i--) {
      const { onFail: curFail } = this._taskStack[i];
      await curFail(this._lastErr, i);
    }
    this._unwound = true;
    this._finished = true;
  }

  private _holdErr(err: any, pcOnErr: number): void {
    this._hasError = true;
    this._errOn = pcOnErr;
    if (err !== null) {
      this._lastErr = err;
    } else {
      this._lastErr = 'N/A';
    }
  }
}
