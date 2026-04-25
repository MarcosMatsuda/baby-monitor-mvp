import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { RTCView, type MediaStream } from 'react-native-webrtc';
import { semantic, spacing, typography, radii } from '@baby-monitor/design-tokens';
import type { ConnectionState } from '@baby-monitor/shared-types';
import { StatusPill, DbMeter, ThresholdSlider, AlertOverlay } from '../components';
import { useElapsedTime } from '../hooks/use-elapsed-time.hook';
import { useLastActivity } from '../hooks/use-last-activity.hook';
import { commonStyles } from '../theme';

interface MonitorScreenProps {
  readonly connectionState: ConnectionState;
  readonly connectedAt: number | null;
  readonly currentDb: number;
  readonly threshold: number;
  readonly alertActive: boolean;
  readonly lastNoiseAt: number | null;
  readonly remoteStream: MediaStream | null;
  readonly videoEnabled: boolean;
  readonly onThresholdChange: (value: number) => void;
  readonly onDismissAlert: () => void;
  readonly onToggleVideo: () => void;
  readonly onDisconnect: () => void;
}

export function MonitorScreen({
  connectionState,
  connectedAt,
  currentDb,
  threshold,
  alertActive,
  lastNoiseAt,
  remoteStream,
  videoEnabled,
  onThresholdChange,
  onDismissAlert,
  onToggleVideo,
  onDisconnect,
}: MonitorScreenProps): React.JSX.Element {
  const elapsed = useElapsedTime(connectedAt);
  const lastActivity = useLastActivity(lastNoiseAt);

  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar',
      'Tem certeza que deseja parar o monitoramento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: onDisconnect,
        },
      ],
    );
  };

  const showVideo = videoEnabled && remoteStream !== null;

  return (
    <View style={commonStyles.screenContainer}>
      <AlertOverlay visible={alertActive} onDismiss={onDismissAlert} />

      <View style={styles.topBar}>
        <StatusPill state={connectionState} />
        <Text style={styles.timer}>{elapsed}</Text>
      </View>

      {showVideo && (
        <View style={styles.videoContainer}>
          <RTCView
            streamURL={(remoteStream as unknown as { toURL: () => string }).toURL()}
            style={styles.video}
            objectFit="cover"
            mirror={false}
          />
        </View>
      )}

      <View style={styles.meterContainer}>
        <DbMeter db={currentDb} />
      </View>

      <View style={styles.activityContainer}>
        <Text style={styles.activityLabel}>{lastActivity}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <ThresholdSlider
          value={threshold}
          onValueChange={onThresholdChange}
        />
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.videoButton,
            videoEnabled && styles.videoButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={onToggleVideo}
        >
          <Text
            style={[
              styles.videoButtonText,
              videoEnabled && styles.videoButtonTextActive,
            ]}
          >
            {videoEnabled ? 'Ocultar câmera' : 'Ver câmera'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.disconnectButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDisconnect}
        >
          <Text style={styles.disconnectText}>Desconectar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[16],
    paddingBottom: spacing[6],
  },
  timer: {
    fontFamily: typography.family.mono,
    fontSize: typography.size.sm,
    color: semantic.text.muted,
  },
  videoContainer: {
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: semantic.bg.primary,
    marginBottom: spacing[4],
  },
  video: {
    flex: 1,
  },
  meterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  activityContainer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  activityLabel: {
    fontSize: typography.size.sm,
    color: semantic.text.muted,
    fontWeight: typography.weight.medium,
  },
  controlsContainer: {
    paddingBottom: spacing[8],
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  videoButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: semantic.text.muted,
  },
  videoButtonActive: {
    borderColor: semantic.status.connected,
  },
  videoButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: semantic.text.muted,
  },
  videoButtonTextActive: {
    color: semantic.status.connected,
  },
  disconnectButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: semantic.status.disconnected,
  },
  disconnectText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: semantic.status.disconnected,
  },
  pressed: {
    opacity: 0.85,
  },
});
