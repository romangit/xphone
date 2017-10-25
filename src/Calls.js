import Call from './Call';

export default class Calls {
  constructor(stack) {
    this.stack = stack;
    this.data = [];
  }

  findByLine(line) {
    for (let i = 0; i < this.data.length; i += 1) {
      if (this.data[i].line === Number(line)) {
        return this.data[i];
      }
    }
    throw new Error('Line not found');
  }

  lineExist(line) {
    for (let i = 0; i < this.data.length; i += 1) {
      if (this.data[i].line === Number(line)) {
        return true;
      }
    }
    return false;
  }

  findForwardCall() {
    for (let i = 0; i < this.data.length; i += 1) {
      if (this.data[i].forward) {
        return this.data[i];
      }
    }
    return null;
  }

  get() {
    return this.data;
  }

  add(phoneNumber, type, id, file) {
    const call = new Call(this.stack, phoneNumber, type, id, file);
    this.data.push(call);
    this.stack.onCreate(call);
    return call.line;
  }

  remove(call) {
    call.finish();
    this.data.splice(this.data.indexOf(call), 1);
    this.stack.onDestroy(call);
  }
}
