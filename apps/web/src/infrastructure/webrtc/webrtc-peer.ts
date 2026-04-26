import {
  WEBRTC_CONFIG,
  DATA_CHANNEL_LABEL,
  VIDEO_MAX_BITRATE_BPS,
} from '@baby-monitor/webrtc-config';
import type { DataChannelMessage, SignalDto } from '@baby-monitor/shared-types';

export class WebRtcPeer {
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private audioTrack: MediaStreamTrack | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private videoSender: RTCRtpSender | null = null;

  public onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null;
  public onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;
  public onDataChannelMessage: ((msg: DataChannelMessage) => void) | null = null;
  public onTrack: ((stream: MediaStream) => void) | null = null;

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

    this.pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        this.onTrack?.(stream);
      }
    };
  }

  addAudioTrack(stream: MediaStream): void {
    const track = stream.getAudioTracks()[0];
    if (track) {
      this.audioTrack = track;
      this.pc.addTrack(track, stream);
    }
  }

  setMicEnabled(enabled: boolean): void {
    if (this.audioTrack) {
      this.audioTrack.enabled = enabled;
    }
  }

  addVideoTrack(stream: MediaStream): void {
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    track.enabled = false;
    this.videoTrack = track;
    this.videoSender = this.pc.addTrack(track, stream);
    this.applyVideoBitrateCap();
  }

  setVideoEnabled(enabled: boolean): void {
    if (this.videoTrack) {
      this.videoTrack.enabled = enabled;
    }
  }

  async setTorchEnabled(enabled: boolean): Promise<void> {
    if (!this.videoTrack) return;
    try {
      await this.videoTrack.applyConstraints({
        advanced: [{ torch: enabled } as MediaTrackConstraintSet],
      });
    } catch {
      // Torch isn't supported on this camera/browser (Safari/iOS, most
      // front cameras). Ignore — the parent already accepts that the
      // command may be a no-op on some devices.
    }
  }

  async setVideoBitrate(maxBitrateBps: number): Promise<void> {
    if (!this.videoSender) return;
    try {
      const params = this.videoSender.getParameters();
      params.encodings = params.encodings?.length
        ? params.encodings.map((e) => ({ ...e, maxBitrate: maxBitrateBps }))
        : [{ maxBitrate: maxBitrateBps }];
      await this.videoSender.setParameters(params);
    } catch {
      // Sender not yet negotiated or browser rejected the change.
    }
  }

  createDataChannel(): RTCDataChannel {
    this.dataChannel = this.pc.createDataChannel(DATA_CHANNEL_LABEL);
    this.wireDataChannelMessages(this.dataChannel);
    return this.dataChannel;
  }

  private wireDataChannelMessages(channel: RTCDataChannel): void {
    channel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as DataChannelMessage;
        this.onDataChannelMessage?.(msg);
      } catch {
        // ignore malformed messages
      }
    };
  }

  private applyVideoBitrateCap(): Promise<void> {
    return this.setVideoBitrate(VIDEO_MAX_BITRATE_BPS);
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
