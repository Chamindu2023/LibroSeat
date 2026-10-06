// Small shared, reusable UI pieces so every screen looks consistent without
// copy-pasting styles. Import what you need: import { PrimaryButton, Card, StatusBadge } from '../../components/UIKit';

import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

export function PrimaryButton({ title, onPress, disabled, loading, color = colors.primary }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, { backgroundColor: color }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text style={styles.primaryButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, color = colors.primary, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.outlineButton, { borderColor: color }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.outlineButtonText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusBadge({ label, tone = 'neutral' }) {
  const toneColor = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    neutral: colors.textMuted,
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: toneColor + '22' }]}>
      <Text style={[styles.badgeText, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ message }) {
  return (
    <View style={styles.emptyState}>
      <Text style={typography.muted}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
  outlineButton: {
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  outlineButtonText: { fontWeight: '600', fontSize: 15 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.lg,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
});
