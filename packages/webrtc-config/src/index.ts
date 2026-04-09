// ============================================================
// @babycam/webrtc-config
// Infrastructure constants — ICE servers, codec preferences
// ============================================================

export interface IceServerConfig {
  readonly urls: string | string[];
  readonly username?: string;
  readonly credential?: string;
}

export const ICE_SERVERS: readonly IceServerConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  ...(process.env.TURN_URL
    ? [
        {
          urls: process.env.TURN_URL,
          username: process.env.TURN_USER ?? '',
          credential: process.env.TURN_PASS ?? '',
        },
      ]
    : []),
] as const;

export const WEBRTC_CONFIG = {
  iceServers: ICE_SERVERS as unknown as RTCIceServer[],
} satisfies RTCConfiguration;

export const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
  },
  video: false,
};

export const DATA_CHANNEL_LABEL = 'telemetry';

export const ANALYSER_FFT_SIZE = 2048;

export const SIGNALING_URL =
  process.env.SIGNALING_URL ?? 'http://localhost:3001';
