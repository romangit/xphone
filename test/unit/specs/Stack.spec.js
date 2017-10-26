import { assert, expect } from 'chai';
import Stack from '../../../src/Stack';
import { SIP_LOGIN, SIP_PASSWORD } from '../../../.env';

const xphone = new Stack();
let mainLine = null;
const echoPrefix = '20000000';
const incomingPhoneNumber = '32342124';
const orderEchoPrefix = '00220000';

describe('Stack', () => {
  it('connection is not open', () => {
    assert.isFalse(xphone.isOpen());
  });

  it('make call on failed connection', () => {
    const phoneNumber = `${echoPrefix}232231`;
    expect(() => xphone.makeCall(phoneNumber)).to.throw('Connection failed');
  });

  it('connect to websocket', done => {
    xphone.onOpen = () => {
      done();
    };
    xphone.init({
      login: SIP_LOGIN,
      password: SIP_PASSWORD,
    });
  }).timeout(10000);

  it('connection is open', () => {
    assert.isTrue(xphone.isOpen());
  });

  it('make call', () => {
    const phoneNumber = `${echoPrefix}341123`;
    mainLine = xphone.makeCall(phoneNumber);
    assert.isNumber(mainLine);
  });

  it('send DTMF', () => {
    const symbol = '4';
    assert.isTrue(xphone.sendDTMF(mainLine, symbol));
  });

  it('hold on call', () => {
    assert.isTrue(xphone.holdCall(mainLine));
  });

  it('hold off call', () => {
    assert.isFalse(xphone.holdCall(mainLine));
  });

  it('conference on call', () => {
    assert.isTrue(xphone.conferenceCall(mainLine));
  });

  it('conference off call', () => {
    assert.isFalse(xphone.conferenceCall(mainLine));
  });

  it('forward on call', () => {
    assert.isTrue(xphone.forwardCall(mainLine));
  });

  it('forward off call', () => {
    assert.isFalse(xphone.forwardCall(mainLine));
  });

  it('get calls', () => {
    assert.equal(xphone.getCalls().length, 1);
  });

  it('forward call', () => {
    const phoneNumber = `${echoPrefix}433434`;
    const forwardLine = xphone.makeCall(phoneNumber);
    xphone.forwardCall(mainLine);
    xphone.forwardCall(forwardLine);
    expect(() => xphone.finishCall(forwardLine)).to.throw('Line not found');
  });

  it('forward main call', () => {
    expect(() => xphone.finishCall(mainLine)).to.throw('Line not found');
  });

  it('forward new call', () => {
    const phoneNumber = `${echoPrefix}938342`;
    const forwardLine = xphone.makeCall(phoneNumber);
    xphone.forwardCall(forwardLine);
    const phoneNumber2 = `${echoPrefix}343432`;
    xphone.makeCall(phoneNumber2);
    expect(() => xphone.finishCall(forwardLine)).to.throw('Line not found');
  });

  it('create call', done => {
    const phoneNumber = `${echoPrefix}221353`;
    xphone.onCreate = call => {
      if (call.phoneNumber === phoneNumber) {
        done();
      }
    };
    const line = xphone.makeCall(phoneNumber);
    setTimeout(() => {
      xphone.finishCall(line);
    }, 1500);
  }).timeout(10000);

  it('finish call', done => {
    const phoneNumber = `${echoPrefix}476472`;
    xphone.onDestroy = call => {
      if (call.phoneNumber === phoneNumber) {
        done();
      }
    };
    const line = xphone.makeCall(phoneNumber);
    setTimeout(() => {
      xphone.finishCall(line);
    }, 1500);
  }).timeout(10000);

  it("can't find call", () => {
    const line = 1000;
    expect(() => xphone.finishCall(line)).to.throw('Line not found');
  });

  it('call connect ', done => {
    const phoneNumber = `${echoPrefix}467384`;
    xphone.onConnect = call => {
      if (call.phoneNumber === phoneNumber) {
        xphone.finishCall(call.line);
        done();
      }
    };
    xphone.makeCall(phoneNumber);
  }).timeout(10000);

  it('incoming call', done => {
    xphone.onCreate = call => {
      if (
        call.type === xphone.INCOMING &&
        call.phoneNumber === incomingPhoneNumber &&
        xphone.acceptCall(call.line)
      ) {
        xphone.finishCall(call.line);
        done();
      }
    };
    xphone.makeCall(`${orderEchoPrefix}${incomingPhoneNumber}`);
  }).timeout(10000);

  it('close connection', done => {
    xphone.onClose = () => {
      done();
    };
    xphone.close();
  });

  it('expected close -> reconnect', done => {
    setTimeout(() => {
      if (xphone.isOpen()) done();
    }, xphone.registerTimeout + 4000);
  }).timeout(10000);

  it('unexpected close -> reconnect', done => {
    xphone.onClose = () => {};
    setTimeout(() => {
      xphone.onClose = () => {
        done();
      };
    }, xphone.registerTimeout - 1000);
    xphone.close(!xphone.EXPECTED_CLOSE);
  }).timeout(10000);

  it('ping', done => {
    setTimeout(() => {
      if (xphone.lastMessageDuration < 25) done();
    }, 26000);
  }).timeout(27000);

  it('call out', done => {
    xphone.callOut = `${echoPrefix}543214`;
    xphone.onCreate = () => {};
    xphone.onConnect = call => {
      if (
        call.type === xphone.INCOMING &&
        call.phoneNumber === incomingPhoneNumber
      ) {
        done();
      }
    };
    xphone.makeCall(`${orderEchoPrefix}${incomingPhoneNumber}`);
  }).timeout(10000);

  it('ping', done => {
    setTimeout(() => {
      if (xphone.lastMessageDuration < 10) done();
    }, 5000);
  }).timeout(6000);
});
