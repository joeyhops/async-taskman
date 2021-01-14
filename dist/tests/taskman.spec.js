import TaskManager from '../index';
import { expect } from 'chai';
import 'mocha';
describe('Async Task Man', () => {
    it('should create new TaskManager Object.', () => {
        const taskMan = new TaskManager(false);
        expect(taskMan).to.haveOwnProperty('_hasError', false);
        expect(taskMan).to.haveOwnProperty('_unwound', false);
    });
});
//# sourceMappingURL=taskman.spec.js.map