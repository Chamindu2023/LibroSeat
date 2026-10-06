// Screen: Notification Detail
// Owned by: Nimnada (Home & Account Module)
// Fully implemented. Marks the notification as read on open (UPDATE),
// and links through to the related reservation if there is one.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { PrimaryButton } from '../../components/UIKit';
import { markNotificationRead } from './accountService';
import { formatDateTime } from '../../hooks/formatDate';

export default function NotificationDetailScreen({ route, navigation }) {
  const { notification } = route.params;

  useEffect(() => {
    if (notification && !notification.isRead) {
      markNotificationRead(notification.id).catch((e) =>
        console.warn('markNotificationRead failed:', e.message)
      );
    }
  }, [notification?.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Ionicons name="notifications" size={40} color={colors.primary} />
        <Text style={[typography.title, { marginTop: spacing.md }]}>Notification</Text>
        <Text style={[typography.body, { marginTop: spacing.sm }]}>{notification.message}</Text>
        <Text style={[typography.muted, { marginTop: spacing.xs }]}>
          {formatDateTime(notification.createdAt)}
        </Text>

        {notification.relatedReservationId ? (
          <View style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}>
            <PrimaryButton
              title="View Reservation"
              onPress={() =>
                navigation.navigate('ReservationDetail', {
                  reservationId: notification.relatedReservationId,
                })
              }
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, alignItems: 'flex-start' },
});
