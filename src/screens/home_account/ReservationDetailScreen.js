// Screen: Reservation Detail
// Owned by: Nimnada (Home & Account Module)
// Fully implemented — live detail view + Mark as Collected (UPDATE) +
// Cancel Reservation (UPDATE) behind a confirmation modal.
//
// Note on the "Cancel Confirmation" screen from Milestone 02: it is
// implemented here as an in-page confirmation Modal rather than a separate
// route/screen. This is a common, accepted mobile UX pattern — it is noted
// here as a deliberate, documented deviation from the Milestone 02
// high-fidelity prototype for the Milestone 03 report.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme/theme';
import { Card, PrimaryButton, OutlineButton, StatusBadge } from '../../components/UIKit';
import {
  subscribeToReservation,
  getRelatedItem,
  markAsCollected,
  cancelReservation,
} from './accountService';
import { formatDateTime } from '../../hooks/formatDate';

const STATUS_TONE = {
  confirmed: 'success',
  collected: 'neutral',
  cancelled: 'danger',
  expired: 'warning',
};

export default function ReservationDetailScreen({ route, navigation }) {
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState(null);
  const [relatedItem, setRelatedItem] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToReservation(reservationId, setReservation);
    return unsubscribe;
  }, [reservationId]);

  useEffect(() => {
    if (reservation) {
      getRelatedItem(reservation).then(setRelatedItem).catch(() => setRelatedItem(null));
    }
  }, [reservation?.refId]);

  if (!reservation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isActive = reservation.status === 'confirmed';
  const itemLabel =
    reservation.type === 'seat'
      ? relatedItem
        ? `Seat ${relatedItem.seatNumber} — ${relatedItem.room}`
        : 'Seat reservation'
      : relatedItem
      ? relatedItem.title
      : 'Book reservation';

  const handleMarkCollected = async () => {
    setBusy(true);
    try {
      await markAsCollected(reservation.id);
    } catch (e) {
      console.warn('markAsCollected failed:', e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCancel = async () => {
    setBusy(true);
    try {
      await cancelReservation(reservation.id);
      setConfirmVisible(false);
      navigation.goBack();
    } catch (e) {
      console.warn('cancelReservation failed:', e.message);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Card>
          <Text style={typography.title}>{itemLabel}</Text>
          <View style={{ marginTop: spacing.sm, flexDirection: 'row' }}>
            <StatusBadge label={reservation.status} tone={STATUS_TONE[reservation.status] || 'neutral'} />
          </View>

          <View style={styles.infoRow}>
            <Text style={typography.muted}>Reservation ID</Text>
            <Text style={typography.body}>{reservation.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={typography.muted}>Reserved on</Text>
            <Text style={typography.body}>{formatDateTime(reservation.createdAt)}</Text>
          </View>
          {reservation.dueDate ? (
            <View style={styles.infoRow}>
              <Text style={typography.muted}>Due date</Text>
              <Text style={typography.body}>{formatDateTime(reservation.dueDate)}</Text>
            </View>
          ) : null}
        </Card>

        {isActive ? (
          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            {reservation.type === 'book' ? (
              <PrimaryButton title="Mark as Collected" onPress={handleMarkCollected} disabled={busy} />
            ) : null}
            <OutlineButton
              title="Cancel Reservation"
              color={colors.danger}
              onPress={() => setConfirmVisible(true)}
            />
          </View>
        ) : null}
      </View>

      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={32} color={colors.warning} />
            <Text style={[typography.subtitle, { marginTop: spacing.sm, textAlign: 'center' }]}>
              Are you sure you want to cancel this reservation?
            </Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <OutlineButton title="No, Go Back" onPress={() => setConfirmVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  title="Yes, Cancel"
                  color={colors.danger}
                  onPress={handleConfirmCancel}
                  disabled={busy}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
});
