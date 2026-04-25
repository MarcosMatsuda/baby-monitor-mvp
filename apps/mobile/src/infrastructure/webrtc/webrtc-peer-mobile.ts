import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { WEBRTC_CONFIG } from '@baby-monitor/webrtc-config';
import type { SignalDto, DataChannelMessage } from '@baby-monitor/shared-types';

export class WebRtcPeerMobile {
  private pc: RTCPeerConnection;
  private dataChannel: any = null;

  public onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null;
  public onTrack: ((stream: MediaStream) => void) | null = null;
  public onDataChannelMessage: ((msg: DataChannelMessage) => void) | null = null;
  public onConnectionStateChange: ((state: string) => void) | null = null;

  constructor() {
    this.pc = new RTCPeerConnection(WEBRTC_CONFIG as any);

    (this.pc as any).onicecandidate = (event: any) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate.toJSON());
      }
    };

    (this.pc as any).ontrack = (event: any) => {
      if (this.onTrack && event.streams?.[0]) {
        this.onTrack(event.streams[0]);
      }
    };

    (this.pc as any).ondatachannel = (event: any) => {
      const channel = event.channel;
      this.dataChannel = channel;
      channel.onmessage = (msg: any) => {
        try {
          const data: DataChannelMessage = JSON.parse(msg.data);
          this.onDataChannelMessage?.(data);
        } catch {
          // ignore malformed messages
        }
      };
    };

    (this.pc as any).onconnectionstatechange = () => {
      this.onConnectionStateChange?.((this.pc as any).connectionState);
    };
  }

  sendData(message: DataChannelMessage): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  async handleOffer(sdp: string): Promise<SignalDto> {
    await this.pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'offer', sdp }) as any,
    );

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer as any);

    return {
      type: 'answer',
      sdp: (answer as any).sdp,
    };
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate) as any);
  }

  close(): void {
    this.pc.close();
  }
}
