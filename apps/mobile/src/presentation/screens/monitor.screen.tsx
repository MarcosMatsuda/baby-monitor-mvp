import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
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
  readonly onThresholdChange: (value: number) => void;
  readonly onDismissAlert: () => void;
  readonly onDisconnect: () => void;
}

export function MonitorScreen({
  connectionState,
  connectedAt,
  currentDb,
  threshold,
  alertActive,
  lastNoiseAt,
  onThresholdChange,
  onDismissAlert,
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

  return (
    <View style={commonStyles.screenContainer}>
      <AlertOverlay visible={alertActive} onDismiss={onDismissAlert} />

      <View style={styles.topBar}>
        <StatusPill state={connectionState} />
        <Text style={styles.timer}>{elapsed}</Text>
      </View>

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
