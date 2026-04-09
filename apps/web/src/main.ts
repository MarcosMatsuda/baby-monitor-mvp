// ============================================================
// Baby Station — Composition Root
// Reads room code from URL, wires all layers, starts streaming
// ============================================================

import { AudioCaptureRepository } from './infrastructure/audio/audio-capture.repository';
import { SignalingClient } from './infrastructure/signaling/signaling.client';
import { WebRtcPeer } from './infrastructure/webrtc/webrtc-peer';
import { BabyStationUi } from './presentation/components/baby-station.ui';
import { AudioLevel } from './domain/entities/audio-level.entity';
import { Connection } from './domain/entities/connection.entity';
import { SIGNALING_URL } from '@babycam/webrtc-config';
import { DB_SEND_INTERVAL_MS } from '@babycam/shared-types';
import type { ConnectionState } from '@babycam/shared-types';
import './presentation/styles/main.css';

class BabyStationApp {
  private readonly audioCapture = new AudioCaptureRepository();
  private readonly signaling = new SignalingClient();
  private readonly webrtc = new WebRtcPeer();
  private readonly ui = new BabyStationUi();
  private readonly connection = new Connection();

  private dbInterval: ReturnType<typeof setInterval> | null = null;

  async start(): Promise<void> {
    const roomCode = this.extractRoomCode();

    if (!roomCode) {
      this.showCodeEntry();
      return;
    }

    this.connection.roomCode = roomCode;
    this.updateState('waiting');

    try {
      await this.signaling.connect(SIGNALING_URL);
      await this.setupMicrophone();
      this.wireSignaling();
      this.wireWebRtc();
      this.setupDisconnect();

      this.signaling.joinRoom(roomCode);
    } catch (error) {
      this.ui.showError(
        error instanceof Error ? error.message : 'Erro ao conectar',
      );
    }
  }

  private extractRoomCode(): string | null {
    const parts = window.location.pathname.split('/');
    const roomIndex = parts.indexOf('room');
    if (roomIndex !== -1 && parts[roomIndex + 1]) {
      return parts[roomIndex + 1].toUpperCase();
    }
    return null;
  }

  private showCodeEntry(): void {
    const input = document.getElementById('code-input') as HTMLInputElement;
    const btn = document.getElementById('code-btn') as HTMLButtonElement;
    const entry = document.getElementById('code-entry') as HTMLElement;

    if (entry) entry.style.display = 'flex';

    btn?.addEventListener('click', () => {
      const code = input?.value.trim().toUpperCase();
      if (code && code.length === 6) {
        window.location.href = `/room/${code}`;
      }
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn?.click();
    });
  }

  private async setupMicrophone(): Promise<void> {
    const stream = await this.audioCapture.requestMicrophone();
    this.audioCapture.startAnalyser(stream);
    this.audioCapture.startKeepAlive();
    this.webrtc.addAudioTrack(stream);
  }

  private wireSignaling(): void {
    this.signaling.onPeerJoined(async (data) => {
      if (data.role === 'baby') {
        this.updateState('connecting');
        this.webrtc.createDataChannel();
        const offer = await this.webrtc.createOffer();
        this.signaling.sendSignal(offer);
        this.startDbStream();
      }
    });

    this.signaling.onSignal(async (data) => {
      if (data.type === 'answer' && data.sdp) {
        await this.webrtc.handleAnswer(data.sdp);
      }
      if (data.type === 'ice-candidate' && data.candidate) {
        await this.webrtc.addIceCandidate(data.candidate);
      }
    });

    this.signaling.onPeerDisconnected(() => {
      this.updateState('disconnected');
      this.stopDbStream();
    });

    this.signaling.onRoomError((data) => {
      this.ui.showError(data.message);
    });
  }

  private wireWebRtc(): void {
    this.webrtc.onIceCandidate = (candidate) => {
      this.signaling.sendSignal({ type: 'ice-candidate', candidate });
    };

    this.webrtc.onConnectionStateChange = (state) => {
      const stateMap: Record<string, ConnectionState> = {
        connecting: 'connecting',
        connected: 'connected',
        disconnected: 'reconnecting',
        failed: 'disconnected',
        closed: 'disconnected',
      };
      const mapped = stateMap[state];
      if (mapped) this.updateState(mapped);
    };
  }

  private startDbStream(): void {
    this.dbInterval = setInterval(() => {
      const db = this.audioCapture.getDbLevel();
      const level = new AudioLevel(db);
      this.webrtc.sendData(level.toJson());
      this.ui.updateDbLevel(db);
    }, DB_SEND_INTERVAL_MS);
  }

  private stopDbStream(): void {
    if (this.dbInterval) {
      clearInterval(this.dbInterval);
      this.dbInterval = null;
    }
  }

  private setupDisconnect(): void {
    this.ui.onDisconnect(() => {
      this.stopDbStream();
      this.audioCapture.stopKeepAlive();
      this.audioCapture.stopAnalyser();
      this.webrtc.close();
      this.signaling.disconnect();
      this.updateState('disconnected');
    });
  }

  private updateState(state: ConnectionState): void {
    this.connection.transition(state);
    this.ui.setConnectionState(state);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new BabyStationApp();
  app.start();
});
