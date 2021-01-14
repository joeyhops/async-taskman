var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class TaskManager {
    constructor(unwind, tasks = null) {
        this._taskStack = [];
        this._lastErr = null;
        this._errOn = null;
        this._PC = 0;
        this._hasError = false;
        this._unwound = false;
        this._finished = false;
        if (tasks && tasks.length > 0) {
            const taskLen = tasks.length;
            for (let i = 0; i < taskLen; i++) {
                this._taskStack.push(tasks[i]);
            }
        }
        this._shouldUnwind = unwind;
    }
    push(task) {
        return this._taskStack.push(task);
    }
    execute() {
        return this._execute().catch(err => {
            this._holdErr(err, this._PC);
            console.log(this._PC, this._taskStack[this._PC]);
        });
    }
    _execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._taskStack.length > 0 && !this._hasError) {
                for (;;) {
                    const currentTask = this._taskStack[this._PC];
                    const { runnable, onFail } = currentTask;
                    if (runnable !== null && onFail !== null) {
                        try {
                            console.log("Trying runnable.");
                            yield runnable;
                            if (this._taskStack.length > this._PC + 1) {
                                this._PC++;
                                continue;
                            }
                            else
                                break;
                        }
                        catch (err) {
                            console.log("Caught");
                            this._holdErr(err, this._PC);
                            if (this._shouldUnwind) {
                                yield this._unwind();
                            }
                            else {
                                const curTask = this._taskStack[this._errOn];
                                const { onFail } = curTask;
                                yield onFail(this._hasError, this._errOn);
                            }
                            break;
                        }
                    }
                }
                this._finished = true;
                return;
            }
        });
    }
    reset(preserveStack) {
        this._unwound = false;
        this._lastErr = null;
        this._hasError = false;
        this._finished = false;
        this._errOn = null;
        if (preserveStack)
            return true;
        this._taskStack = [];
    }
    stackLength() {
        return this._taskStack.length;
    }
    _unwind() {
        return __awaiter(this, void 0, void 0, function* () {
            const taskPointer = this._errOn;
            for (let i = taskPointer; i >= 0; i--) {
                const { onFail: curFail } = this._taskStack[i];
                yield curFail(this._lastErr, i);
            }
            this._unwound = true;
            this._finished = true;
        });
    }
    _holdErr(err, pcOnErr) {
        this._hasError = true;
        this._errOn = pcOnErr;
        if (err !== null) {
            this._lastErr = err;
        }
        else {
            this._lastErr = 'N/A';
        }
    }
}
//# sourceMappingURL=index.js.map