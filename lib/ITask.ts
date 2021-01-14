export interface ITask {
  runnable: Promise<any>;
  onFail: { (err: any, taskId: number): Promise<void>; };
}