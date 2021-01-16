import TaskManager from '../index';
import { ITaskManager } from '../ITaskManager';
import { ITask } from '../ITask';
import * as chai from 'chai';
import * as CAP from 'chai-as-promised';
import 'mocha';

chai.use(CAP);

const expect = chai.expect;

import { testPromise, testPromiseExecutes, testPromiseReject } from './testparts';

describe('Async Task Man', () => {
  it ('should create new TaskManager Object.', () => {
    const taskMan = new TaskManager(false);
    expect(taskMan).to.exist

    expect(taskMan._hasError).to.be.false;
    expect(taskMan._unwound).to.be.false
  });

  it('Should allow pushing to the task stack and return the current stack length.', () => {
    const taskMan: ITaskManager = new TaskManager(false);
    expect(taskMan).to.exist;

    let stackLen: number = taskMan.stackLength();
    expect(stackLen).to.be.equal(0);

    const emptyTask: ITask = {
      runnable: new Promise((res, rej) => { res(true); }),
      onFail: async (): Promise<void> => {}
    };
    const pushLen: number = taskMan.push(emptyTask);

    stackLen = taskMan.stackLength();
    expect(stackLen).to.be.equal(1);
    expect(stackLen).to.be.equal(pushLen);
  });

  it('Should execute Promise upon execute request.', async () => {
    const taskMan: ITaskManager = new TaskManager(false);
    expect(taskMan).to.exist;

    const demoTask: ITask = {
      runnable: testPromise(),
      onFail: async () => {}
    };
    const pushLen: number = taskMan.push(demoTask);
    const stackLen: number = taskMan.stackLength();
    expect(pushLen).to.be.equal(stackLen);

    await taskMan.execute();
    expect(taskMan._hasError).to.equal(false);
  });

  it('Should execute Promises on Stack in Sequence.', (done) => {
    const expectedString: string = '12345';
    
    const taskMan: ITaskManager = new TaskManager(false);
    expect(taskMan).to.exist;

    const demoTaskNoCB: ITask = {
      runnable: testPromise(),
      onFail: async () => {}
    };
    
    const demoTaskCB: ITask = {
      runnable: testPromiseExecutes(expectedString),
      onFail: async () => {}
    };
    let pushLen: number = taskMan.push(demoTaskNoCB);
    let stackLen: number = taskMan.stackLength();
    expect(pushLen).to.equal(stackLen);

    pushLen = taskMan.push(demoTaskCB);
    stackLen = taskMan.stackLength();
    expect(pushLen).to.equal(stackLen);

    taskMan.execute().then(() => {
      expect(taskMan._hasError).to.be.false;
      done();
    });
  });

  it('Should catch error thrown in promise and redirect execution to onFail function.', (done) => {
    const taskMan: ITaskManager = new TaskManager(false);
    expect(taskMan).to.exist;

    const demoTask: ITask = {
      runnable: testPromiseReject(),
      onFail: async (err, taskId): Promise<void> => {
        console.log(err);
        //expect(err).to.exist;
        expect(taskId).to.equal(0);
      }
    };
    let stackLen: number = taskMan.stackLength();
    expect(stackLen).to.equal(0);
    const pushLen: number = taskMan.push(demoTask);
    stackLen = taskMan.stackLength();
    expect(stackLen).to.equal(pushLen);
    expect(pushLen).to.equal(1);

    taskMan.execute().then(() => {
      done();
    });
  });

  it('Should catch error thrown in promise and unwind stack to the first tasks onFail function.', (done) => {
    const taskMan: ITaskManager = new TaskManager(true);
    expect(taskMan).to.exist;

    const demoTask1: ITask = {
      runnable: testPromise(),
      onFail: async (err, taskId): Promise<void> => {
        expect(taskId).to.equal(0);
        done();
      }
    };

    const demoTask2: ITask = {
      runnable: testPromise(),
      onFail: async (err, taskId): Promise<void> => {
        expect(taskId).to.equal(1);
      }
    };

    const demoTask3: ITask = {
      runnable: testPromiseReject(),
      onFail: async (err, taskId): Promise<void> => {
        expect(taskId).to.equal(2);
      }
    };

    const stackLen: number = taskMan.stackLength();
    expect(stackLen).to.equal(0);

    taskMan.push(demoTask1);
    taskMan.push(demoTask2);
    const finalPush: number = taskMan.push(demoTask3);
    expect(finalPush).to.equal(3);

    taskMan.execute().then(() => {
      expect(taskMan._unwound).to.equal(true);
    });
  });
});
