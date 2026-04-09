import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, semantic, spacing, typography } from '@babycam/design-tokens';
import { commonStyles } from '../theme';

interface RoleSelectionScreenProps {
  readonly onSelectParent: () => void;
  readonly onSelectBaby: () => void;
}

export function RoleSelectionScreen({
  onSelectParent,
  onSelectBaby,
}: RoleSelectionScreenProps): React.JSX.Element {
  return (
    <View style={commonStyles.centeredContainer}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Baby<Text style={styles.logoAccent}>Cam</Text>
        </Text>
        <Text style={styles.tagline}>
          Transforme dois celulares em uma babá eletrônica
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            commonStyles.buttonPrimary,
            styles.mainButton,
            pressed && styles.pressed,
          ]}
          onPress={onSelectParent}
        >
          <Text style={commonStyles.buttonPrimaryText}>Sou o pai / mãe</Text>
          <Text style={styles.buttonHint}>Monitorar o bebê neste celular</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            commonStyles.buttonOutline,
            styles.mainButton,
            pressed && styles.pressed,
          ]}
          onPress={onSelectBaby}
        >
          <Text style={commonStyles.buttonOutlineText}>Configurar babá</Text>
          <Text style={styles.buttonHintMuted}>
            Instruções para o celular no quarto
          </Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        O celular da babá usa o navegador — sem instalar nada
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[16],
  },
  logo: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: semantic.text.primary,
    letterSpacing: -1,
  },
  logoAccent: {
    color: colors.teal[500],
  },
  tagline: {
    fontSize: typography.size.base,
    color: semantic.text.secondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  buttons: {
    width: '100%',
    gap: spacing[4],
  },
  mainButton: {
    width: '100%',
    paddingVertical: spacing[5],
    gap: spacing[1],
  },
  buttonHint: {
    fontSize: typography.size.xs,
    color: colors.teal[800],
    fontWeight: typography.weight.regular,
  },
  buttonHintMuted: {
    fontSize: typography.size.xs,
    color: semantic.text.muted,
    fontWeight: typography.weight.regular,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  footer: {
    position: 'absolute',
    bottom: spacing[10],
    fontSize: typography.size.xs,
    color: semantic.text.muted,
    textAlign: 'center',
  },
});
