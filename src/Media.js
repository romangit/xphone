export default class Media {
  constructor() {
    this.localMediaStream = null;
    this.PeerConnection = window.RTCPeerConnection;
    this.SessionDescription = window.RTCSessionDescription;
    this.pc = null;

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
  }

  gotRemoteStream() {
    return this;
  }

  onError() {
    return this;
  }

  onCreate() {
    return this;
  }

  createUserMedia() {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then(stream => {
        this.localMediaStream = stream;
        this.createOffer();
      })
      .catch(error => {
        this.onError(error);
      });
  }

  disableUserMedia() {
    if (this.localMediaStream) {
      this.localMediaStream.getTracks()[0].stop();
    }
    if (this.pc && this.pc.iceConnectionState !== 'closed') {
      this.pc.close();
    }
  }

  setRemoteSdp(sdp) {
    if (this.pc && typeof this.pc.setRemoteDescription === 'function') {
      this.pc.setRemoteDescription(new this.SessionDescription(sdp));
    }
  }

  createOffer() {
    this.pc = new this.PeerConnection(null);
    // noinspection JSUnresolvedFunction
    this.pc.addStream(this.localMediaStream);
    this.pc.onaddstream = this.gotRemoteStream;
    this.pc
      .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false })
      .then(description => {
        this.pc.setLocalDescription(description);
        this.onCreate(description);
      })
      .catch(error => {
        this.onError({
          message: error,
        });
      });
  }
}
