import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';
import { OutlineButton, PrimaryButton } from './UIKit';

export default function LogoutConfirmModal({ visible, title, message, onCancel, onConfirm }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [anim, visible]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity: anim, transform: [{ scale }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="exit-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <View style={styles.action}>
              <OutlineButton title="Cancel" onPress={onCancel} />
            </View>
            <View style={styles.action}>
              <PrimaryButton title="Log Out" onPress={onConfirm} color={colors.danger} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.primary + '14',
  },
  title: { ...typography.subtitle, fontSize: 18, textAlign: 'center' },
  message: { ...typography.muted, marginTop: spacing.sm, textAlign: 'center', lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  action: { flex: 1 },
});
