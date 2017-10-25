import Calls from './Calls';
import Media from './Media';
import { authTemplate, msgTemplate } from './Template';

export default class Stack {
  constructor() {
    this.id = Math.random()
      .toString(36)
      .substring(7);
    this.socket = null;
    this.lastMessageDuration = 0;
    this.timer = null;
    this.calls = new Calls(this);
    this.media = new Media();
    this.REMOTE = 1;
    this.EXPECTED_CLOSE = true;
    this.credentials = authTemplate;
    this.REGISTER_DELAY = 5 * 1000;
    this.registerTimeout = this.REGISTER_DELAY;
    this.INCOMING = 0;
    this.OUTGOING = 1;
    this.wsURL = 'wss://lira.voip.com.ua:1887';
    this.mainWsURL = this.wsURL;
    this.callOut = '';
    this.player = document.createElement('AUDIO');
    this.player.setAttribute('autoplay', 'autoplay');
    this.player.setAttribute('id', this.id);
    this.reConnect = true;
    this.isExpectedClose = false;
  }

  init(params) {
    const initParams = params;
    initParams.phone_number =
      typeof params.phone_number !== 'undefined' || params.phone_number === ''
        ? params.phone_number
        : params.login;

    this.credentials = initParams;

    this.socket = new WebSocket(this.wsURL);

    this.socket.onopen = () => {
      this.send({
        connect: initParams,
      });
    };

    this.socket.onclose = event => {
      if (!this.isExpectedClose) {
        this.wsURL = this.mainWsURL;
      }
      this.onClose(event);
      this.isExpectedClose = false;
      this.stopTimer();
      this.autoInit();
    };

    this.socket.onerror = error => {
      this.onError({
        message: error,
      });
    };

    this.socket.onmessage = event => {
      this.onMessage(event);
    };

    this.media.gotRemoteStream = event => {
      if (this.player) {
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        this.player.src = URL.createObjectURL(event.stream);
      }
    };

    this.media.onCreate = description => {
      this.send(description);
    };

    this.media.onError = event => {
      this.onError({
        message: event,
      });
    };

    if (!document.getElementById(this.id)) {
      document.body.appendChild(this.player);
    }
  }

  close(isExpectedClose = false) {
    this.isExpectedClose = isExpectedClose;
    if (this.socket) {
      this.socket.close();
    }
    this.media.disableUserMedia();
  }

  autoInit() {
    if (!this.isOpen() && this.reConnect) {
      setTimeout(() => {
        this.init(this.credentials);
        this.registerTimeout *= 2;
      }, this.registerTimeout);
    }
  }

  send(message) {
    if (this.isOpen()) {
      this.socket.send(JSON.stringify(message));
    }
    return 0;
  }

  sendInfo(message, line) {
    this.send({
      info: message,
      msg_values: {
        line,
      },
    });
    return 0;
  }

  isOpen() {
    return (
      typeof this.socket !== 'undefined' &&
      this.socket !== null &&
      this.socket.readyState === WebSocket.OPEN
    );
  }

  onOpen() {
    return this;
  }

  onClose() {
    return this;
  }

  onError() {
    return this;
  }

  onCreate() {
    return this;
  }

  onChange() {
    return this;
  }

  onConnect() {
    return this;
  }

  onDestroy() {
    return this;
  }

  makeCall(phoneNumber, type = this.OUTGOING, lvpId = null) {
    if (!this.isOpen()) {
      this.onError({
        message: 'Connection failed',
      });
      throw new Error('Connection failed');
    }
    const line = this.calls.add(phoneNumber, type, lvpId);
    if (type === this.OUTGOING && this.calls.findForwardCall()) {
      this.forwardCall(line);
    }
    return line;
  }

  finishCall(line) {
    const call = this.calls.findByLine(line);
    this.calls.remove(call);
    return call;
  }

  acceptCall(line) {
    return this.calls.findByLine(line).accept();
  }

  sendDTMF(line, symbol) {
    this.send({
      info: 'sendDTMF',
      msg_values: {
        line: `${symbol}${line}`,
      },
    });
    return true;
  }

  holdCall(line) {
    return this.calls.findByLine(line).toggleHold();
  }

  conferenceCall(line) {
    return this.calls.findByLine(line).toggleConference();
  }

  forwardCall(line) {
    const existForwardCall = this.calls.findForwardCall();
    const call = this.calls.findByLine(line);
    const isForward = call.toggleForward();
    if (isForward && existForwardCall) {
      this.send({
        info: 'forward',
        msg_values: {
          line: `${existForwardCall.line}_${call.line}`,
        },
      });
      this.calls.remove(existForwardCall);
      this.calls.remove(call);
    }
    return isForward;
  }

  getCalls() {
    return this.calls.get();
  }

  doTimer() {
    this.timer = setInterval(() => {
      this.lastMessageDuration += 1;
      if (this.lastMessageDuration >= 25) {
        this.close();
      }
    }, 1000);
  }

  startTimer() {
    this.doTimer();
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  onMessage(event) {
    const msg = JSON.parse(event.data) || msgTemplate;
    const msgType = msg.msg_type;
    const msgValues = msg.msg_values;

    this.lastMessageDuration = 0;

    if (
      Object.prototype.hasOwnProperty.call(msgValues, 'line') &&
      !this.calls.lineExist(msgValues.line)
    ) {
      return;
    }

    switch (msgType) {
      case 'route':
        this.registerTimeout = this.REGISTER_DELAY;
        this.startTimer();
        this.onOpen();
        break;
      case 'ping':
        this.send({
          pong: 'pong',
        });
        break;
      case 'invited': {
        const phoneNumber = msgValues.ani_num;
        const line = this.makeCall(phoneNumber, this.INCOMING, msgValues.id);
        if (this.callOut) {
          setTimeout(() => {
            this.createMessage('accepted', {
              line,
            });
          }, 4000);
        }
        break;
      }
      case 'callme':
        if (this.callOut) {
          this.send({ callout: this.callOut });
        } else {
          this.media.createUserMedia();
        }
        break;
      case 'byed':
        this.finishCall(msgValues.line, this.REMOTE);
        break;
      case 'accepted':
        this.acceptCall(msgValues.line);
        break;
      case 'volume_on':
        if (Number(msgValues.voice) === 0) {
          this.media.disableUserMedia();
          this.send({
            webrtc: 'close',
          });
        }
        break;
      case 'sdp':
        this.media.setRemoteSdp(msgValues);
        break;
      case 'webrtc_restart':
        this.media.disableUserMedia();
        this.media.createUserMedia();
        break;
      case 'url_rec':
        this.calls.findByLine(msgValues.line).set('file', msgValues.url);
        break;
      case 'reconnect':
        this.close(this.EXPECTED_CLOSE);
        break;
      default:
        break;
    }
  }
  createMessage(msgType, msgValues) {
    const event = {
      data: JSON.stringify({
        msg_type: msgType,
        msg_values: msgValues,
      }),
    };
    this.onMessage(event);
  }
}
