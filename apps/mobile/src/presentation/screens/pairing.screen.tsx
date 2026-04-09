import React from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform } from 'react-native';
import { colors, semantic, spacing, typography, radii } from '@babycam/design-tokens';
import type { ConnectionState } from '@babycam/shared-types';
import { StatusPill } from '../components';
import { commonStyles } from '../theme';

interface PairingScreenProps {
  readonly roomCode: string;
  readonly connectionState: ConnectionState;
  readonly baseUrl: string;
  readonly onBack: () => void;
}

export function PairingScreen({
  roomCode,
  connectionState,
  baseUrl,
  onBack,
}: PairingScreenProps): React.JSX.Element {
  const fullUrl = `${baseUrl}/room/${roomCode}`;

  const handleCopyLink = async () => {
    try {
      await Share.share({
        message: fullUrl,
        ...(Platform.OS === 'ios' ? { url: fullUrl } : {}),
      });
    } catch {
      // user cancelled share sheet
    }
  };

  return (
    <View style={commonStyles.centeredContainer}>
      <StatusPill state={connectionState} />

      <View style={styles.codeContainer}>
        <Text style={styles.instruction}>
          No celular da babá, abra o navegador e acesse:
        </Text>
        <Text style={commonStyles.monoLarge}>{roomCode}</Text>
        <Text style={styles.url} selectable>
          {fullUrl}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.copyButton,
          pressed && styles.pressed,
        ]}
        onPress={handleCopyLink}
      >
        <Text style={styles.copyButtonText}>Compartilhar link</Text>
      </Pressable>

      <View style={styles.waitingContainer}>
        <Text style={styles.waitingText}>Aguardando conexão da babá...</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>
      </View>

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  codeContainer: {
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[12],
    marginBottom: spacing[8],
  },
  instruction: {
    fontSize: typography.size.sm,
    color: semantic.text.secondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  url: {
    fontFamily: typography.family.mono,
    fontSize: typography.size.sm,
    color: semantic.text.muted,
  },
  copyButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    backgroundColor: semantic.bg.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: semantic.border.default,
  },
  copyButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.teal[500],
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  waitingContainer: {
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[12],
  },
  waitingText: {
    fontSize: typography.size.sm,
    color: semantic.text.muted,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: semantic.bg.surface,
  },
  dotActive: {
    backgroundColor: colors.teal[500],
  },
  backButton: {
    position: 'absolute',
    bottom: spacing[10],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  backText: {
    fontSize: typography.size.sm,
    color: semantic.text.muted,
  },
});
