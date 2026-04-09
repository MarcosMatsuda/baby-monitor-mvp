import { StyleSheet } from 'react-native';
import { colors, semantic, spacing, typography, radii, shadows } from '@babycam/design-tokens';

export const theme = {
  colors,
  semantic,
  spacing,
  typography,
  radii,
  shadows,
} as const;

// Common reusable styles
export const commonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: semantic.bg.primary,
    paddingHorizontal: spacing[6],
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: semantic.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: semantic.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    color: semantic.text.secondary,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  monoLarge: {
    fontFamily: typography.family.mono,
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.semibold,
    color: semantic.text.primary,
    letterSpacing: 4,
  },
  buttonPrimary: {
    backgroundColor: colors.teal[500],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: radii.lg,
    alignItems: 'center' as const,
  },
  buttonPrimaryText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.teal[900],
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: semantic.border.default,
    alignItems: 'center' as const,
  },
  buttonOutlineText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: semantic.text.secondary,
  },
  statusPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: radii.full,
    backgroundColor: semantic.bg.surface,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  statusText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  card: {
    backgroundColor: semantic.bg.secondary,
    borderRadius: radii.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: semantic.border.subtle,
  },
});

export type Theme = typeof theme;
