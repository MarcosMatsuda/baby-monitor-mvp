import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Vibration } from 'react-native';
import type { MediaStream } from 'react-native-webrtc';
import { semantic } from '@baby-monitor/design-tokens';
import type { ConnectionState, DataChannelMessage } from '@baby-monitor/shared-types';
import { ENV } from './src/infrastructure/config/env';

import { RoleSelectionScreen } from './src/presentation/screens/role-selection.screen';
import { PairingScreen } from './src/presentation/screens/pairing.screen';
import { MonitorScreen } from './src/presentation/screens/monitor.screen';

import { useConnection } from './src/presentation/stores/connection.store';
import { useMonitor } from './src/presentation/stores/monitor.store';

import { SignalingRepository } from './src/infrastructure/signaling/signaling.repository';
import { WebRtcPeerMobile } from './src/infrastructure/webrtc/webrtc-peer-mobile';
import { AlertEngine } from './src/domain/entities/alert-engine.entity';
import { ProcessDbReadingUseCase } from './src/domain/use-cases/process-db-reading.use-case';

type Screen = 'role-selection' | 'pairing' | 'monitor';

const VIBRATION_PATTERN = [200, 100, 200, 100, 400];
const BASE_URL = ENV.BABY_STATION_URL;

// ---- Singletons (created once, survive screen transitions) ----
const signalingRepo = new SignalingRepository();
const alertEngine = new AlertEngine();
const processDbReading = new ProcessDbReadingUseCase(alertEngine);
let webrtcPeer: WebRtcPeerMobile | null = null;

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('role-selection');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const connection = useConnection();
  const monitor = useMonitor();

  // ---- Handlers ----

  const handleSelectParent = useCallback(async () => {
    try {
      connection.setState('waiting');
      await signalingRepo.connect(ENV.SIGNALING_URL);
      const roomCode = await signalingRepo.createRoom();
      connection.setRoomCode(roomCode);
      setScreen('pairing');

      // Wire signaling for WebRTC handshake
      signalingRepo.onSignal(async (data) => {
        if (!webrtcPeer) return;

        if (data.type === 'offer' && data.sdp) {
          const answer = await webrtcPeer.handleOffer(data.sdp);
          signalingRepo.sendSignal(answer);
        }

        if (data.type === 'ice-candidate' && data.candidate) {
          await webrtcPeer.addIceCandidate(data.candidate);
        }
      });

      signalingRepo.onPeerJoined(() => {
        // Baby station connected — create WebRTC peer
        webrtcPeer = new WebRtcPeerMobile();

        webrtcPeer.onConnectionStateChange = (state: string) => {
          const map: Record<string, ConnectionState> = {
            connecting: 'connecting',
            connected: 'connected',
            disconnected: 'reconnecting',
            failed: 'disconnected',
            closed: 'disconnected',
          };
          const mapped = map[state];
          if (mapped) {
            connection.setState(mapped);
            if (mapped === 'connected') setScreen('monitor');
          }
        };

        webrtcPeer.onDataChannelMessage = (msg: DataChannelMessage) => {
          if (msg.type === 'db') {
            monitor.pushReading(msg.value);

            const result = processDbReading.execute({
              value: msg.value,
              ts: msg.ts,
              threshold: monitor.threshold,
            });

            if (result.alertAction === 'trigger') {
              monitor.setAlertState('triggered');
              Vibration.vibrate(VIBRATION_PATTERN, true);
            }

            if (result.alertAction === 'dismiss') {
              monitor.setAlertState('idle');
              Vibration.cancel();
            }
          }
        };

        webrtcPeer.onIceCandidate = (candidate) => {
          signalingRepo.sendSignal({ type: 'ice-candidate', candidate });
        };

        webrtcPeer.onTrack = (stream) => {
          setRemoteStream(stream);
        };

        connection.setState('connecting');
      });

      signalingRepo.onPeerDisconnected(() => {
        connection.setState('disconnected');
        Vibration.cancel();
        webrtcPeer?.close();
        webrtcPeer = null;
        signalingRepo.disconnect();
        connection.reset();
        monitor.reset();
        alertEngine.reset();
        setRemoteStream(null);
        setVideoEnabled(false);
        setScreen('role-selection');
      });

    } catch {
      connection.setState('disconnected');
    }
  }, [connection, monitor]);

  const handleSelectBaby = useCallback(() => {
    // Show instructions — in MVP just alert, future: bottom sheet
  }, []);

  const handleBack = useCallback(() => {
    signalingRepo.disconnect();
    connection.reset();
    monitor.reset();
    alertEngine.reset();
    setRemoteStream(null);
    setVideoEnabled(false);
    setScreen('role-selection');
  }, [connection, monitor]);

  const handleDismissAlert = useCallback(() => {
    alertEngine.dismiss();
    monitor.setAlertState('idle');
    Vibration.cancel();
  }, [monitor]);

  const handleToggleVideo = useCallback(() => {
    setVideoEnabled((prev) => {
      const next = !prev;
      webrtcPeer?.sendData({
        type: 'video-toggle',
        enabled: next,
        ts: Date.now(),
      });
      return next;
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    webrtcPeer?.close();
    webrtcPeer = null;
    signalingRepo.disconnect();
    connection.reset();
    monitor.reset();
    alertEngine.reset();
    setRemoteStream(null);
    setVideoEnabled(false);
    setScreen('role-selection');
  }, [connection, monitor]);

  // ---- Render ----

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {screen === 'role-selection' && (
        <RoleSelectionScreen
          onSelectParent={handleSelectParent}
          onSelectBaby={handleSelectBaby}
        />
      )}

      {screen === 'pairing' && connection.roomCode && (
        <PairingScreen
          roomCode={connection.roomCode}
          connectionState={connection.state}
          baseUrl={BASE_URL}
          onBack={handleBack}
        />
      )}

      {screen === 'monitor' && (
        <MonitorScreen
          connectionState={connection.state}
          connectedAt={connection.connectedAt}
          currentDb={monitor.currentDb}
          threshold={monitor.threshold}
          alertActive={monitor.alertState === 'triggered'}
          lastNoiseAt={monitor.lastNoiseAt}
          remoteStream={remoteStream}
          videoEnabled={videoEnabled}
          onThresholdChange={monitor.setThreshold}
          onDismissAlert={handleDismissAlert}
          onToggleVideo={handleToggleVideo}
          onDisconnect={handleDisconnect}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semantic.bg.primary,
  },
});
