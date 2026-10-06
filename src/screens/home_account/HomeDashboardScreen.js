import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOutAccount } from '../../supabase/authService';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';
import { Card, OutlineButton, PrimaryButton, StatusBadge } from '../../components/UIKit';
import { colors, spacing, typography } from '../../theme/theme';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { formatDateTime } from '../../hooks/formatDate';
import { subscribeToReservations } from './accountService';

export default function HomeDashboardScreen({ navigation }) {
  const userId = useCurrentUserId();
  const [nextReservation, setNextReservation] = useState(null);
  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    if (!userId) {
      setNextReservation(null);
      return undefined;
    }
    const unsubscribe = subscribeToReservations(userId, (reservations) => {
      const active = reservations.find((r) => r.status === 'confirmed');
      setNextReservation(active ?? null);
    });
    return unsubscribe;
  }, [userId]);

  const handleLogout = async () => {
    setLogoutVisible(false);
    await signOutAccount();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={typography.title}>Hi, Sanduni</Text>
            <Text style={typography.muted}>Welcome back</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setLogoutVisible(true)}>
            <Ionicons name="log-out-outline" size={23} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[typography.subtitle, styles.sectionLabel]}>Your Next Reservation</Text>
        <Card>
          {nextReservation ? (
            <>
              <View style={styles.cardHeader}>
                <Text style={typography.body}>
                  {nextReservation.type === 'seat' ? 'Seat reservation' : 'Book reservation'}
                </Text>
                <StatusBadge label="Active" tone="success" />
              </View>
              <Text style={typography.muted}>Expires in 45 min</Text>
              <Text style={[typography.muted, { marginTop: spacing.xs }]}>
                Reserved on {formatDateTime(nextReservation.createdAt)}
              </Text>
              <TouchableOpacity
                style={{ marginTop: spacing.sm }}
                onPress={() => navigation.navigate('ReservationDetail', { reservationId: nextReservation.id })}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>View details -></Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={typography.muted}>You have no active reservations right now.</Text>
          )}
        </Card>

        <Text style={[typography.subtitle, styles.sectionLabel]}>Quick Actions</Text>
        <View style={{ gap: spacing.sm }}>
          <PrimaryButton title="Search Books" onPress={() => navigation.navigate('SearchBooks')} />
          <PrimaryButton title="Book a Seat" onPress={() => navigation.navigate('SeatAvailability')} />
          <OutlineButton title="My Reservations" onPress={() => navigation.navigate('MyReservations')} />
          <OutlineButton title="Payment Details" onPress={() => navigation.navigate('PaymentDetails')} />
        </View>

        <Text style={[typography.subtitle, styles.sectionLabel]}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <ActivityRow icon="notifications-outline" title="Notifications" onPress={() => navigation.navigate('Notifications')} />
          <View style={styles.separator} />
          <ActivityRow icon="calendar-outline" title="My Reservations" onPress={() => navigation.navigate('MyReservations')} />
          <View style={styles.separator} />
          <ActivityRow icon="card-outline" title="Payment Details" onPress={() => navigation.navigate('PaymentDetails')} />
        </Card>
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutVisible}
        title="Log Out"
        message="Are you sure you want to log out of your LibroSeat account?"
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

function ActivityRow({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.activityRow} onPress={onPress}>
      <View style={styles.activityLeft}>
        <Ionicons name={icon} size={21} color={colors.primary} />
        <Text style={typography.body}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  activityCard: { paddingVertical: spacing.sm },
  activityRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  separator: { height: 1, backgroundColor: colors.border },
});
