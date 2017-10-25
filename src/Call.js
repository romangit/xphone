export default class Call {
  constructor(stack, phoneNumber, type, id) {
    this.stack = stack;
    this.phoneNumber = phoneNumber;
    this.type = type;
    this.id = id || null;

    Call.line += 1;
    this.line = Call.line;
    this.startDate = new Date();
    this.connectDate = null;
    this.hold = false;
    this.conference = false;
    this.forward = false;
    this.file = '#';

    this.init();
  }

  init() {
    switch (this.type) {
      case 1:
        this.stack.send({
          invite: `sip:${this.phoneNumber}@${this.line}`,
        });
        break;
      case 0:
        this.stack.send({
          ringing: {
            id: this.id,
            line: `${this.line}`,
          },
        });
        break;
      default:
        break;
    }
  }

  set(property, value) {
    if (typeof property === 'string' && this.setProp(property, value)) {
      this.stack.onChange(this);
    }

    if (typeof property === 'object') {
      let changes = 0;
      Object.getOwnPropertyNames(property).forEach(key => {
        if (this.setProp(key, property[key])) {
          changes += 1;
        }
      });
      if (changes) this.stack.onChange(this);
    }
  }

  setProp(property, value) {
    let changed = false;
    if (typeof this[property] !== 'undefined' && this[property] !== value) {
      this[property] = value;
      if (property === 'connectDate') {
        this.stack.onConnect(this);
      }
      changed = true;
    }
    return changed;
  }

  finish() {
    this.stack.sendInfo('bye', this.line);
    return true;
  }

  accept() {
    this.set('connectDate', new Date());
    this.stack.send({
      accept: {
        line: this.line,
      },
    });
    return true;
  }

  toggleHold() {
    this.set('hold', !this.hold);
    this.stack.sendInfo(this.hold ? 'on_hold' : 'off_hold', this.line);
    return this.hold;
  }

  toggleConference() {
    this.set('conference', !this.conference);
    this.stack.sendInfo(
      this.conference ? 'on_conference' : 'off_conference',
      this.line,
    );
    return this.conference;
  }

  toggleForward() {
    this.set('forward', !this.forward);
    return this.forward;
  }
}

Call.line = 0;
