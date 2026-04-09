import { WEBRTC_CONFIG, DATA_CHANNEL_LABEL } from '@babycam/webrtc-config';
import type { SignalDto } from '@babycam/shared-types';

export class WebRtcPeer {
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;

  public onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null;
  public onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;

  constructor() {
    this.pc = new RTCPeerConnection(WEBRTC_CONFIG);

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate.toJSON());
      }
    };

    this.pc.onconnectionstatechange = () => {
      this.onConnectionStateChange?.(this.pc.connectionState);
    };
  }

  addAudioTrack(stream: MediaStream): void {
    const track = stream.getAudioTracks()[0];
    if (track) {
      this.pc.addTrack(track, stream);
    }
  }

  createDataChannel(): RTCDataChannel {
    this.dataChannel = this.pc.createDataChannel(DATA_CHANNEL_LABEL);
    return this.dataChannel;
  }

  async createOffer(): Promise<SignalDto> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    return {
      type: 'offer',
      sdp: offer.sdp,
    };
  }

  async handleAnswer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp }),
    );
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  sendData(message: string): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(message);
    }
  }

  getState(): RTCPeerConnectionState {
    return this.pc.connectionState;
  }

  close(): void {
    this.dataChannel?.close();
    this.pc.close();
  }
}
