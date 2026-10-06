// Screen: My Reservations / Profile
// Owned by: Nimnada (Home & Account Module)
// Fully implemented — Active/Past tab switch over a live reservation list.

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme/theme';
import { Card, StatusBadge, EmptyState } from '../../components/UIKit';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { subscribeToReservations } from './accountService';
import { formatDateTime } from '../../hooks/formatDate';

const ACTIVE_STATUSES = ['confirmed'];
const PAST_STATUSES = ['collected', 'cancelled', 'expired'];

const STATUS_TONE = {
  confirmed: 'success',
  collected: 'neutral',
  cancelled: 'danger',
  expired: 'warning',
};

export default function MyReservationsScreen({ navigation }) {
  const userId = useCurrentUserId();
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState('active'); // 'active' | 'past'

  useEffect(() => {
    const unsubscribe = subscribeToReservations(userId, setReservations);
    return unsubscribe;
  }, [userId]);

  const filtered = reservations.filter((r) =>
    tab === 'active' ? ACTIVE_STATUSES.includes(r.status) : PAST_STATUSES.includes(r.status)
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle-outline" size={48} color={colors.primary} />
        <View style={{ marginLeft: spacing.sm }}>
          <Text style={typography.subtitle}>Student</Text>
          <Text style={typography.muted}>ID: {userId}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TabButton label="Active" active={tab === 'active'} onPress={() => setTab('active')} />
        <TabButton label="Past" active={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      <FlatList
        contentContainerStyle={styles.container}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={`No ${tab} reservations.`} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ReservationDetail', { reservationId: item.id })}
          >
            <Card>
              <View style={styles.row}>
                <Ionicons
                  name={item.type === 'seat' ? 'grid-outline' : 'book-outline'}
                  size={22}
                  color={colors.primary}
                  style={{ marginRight: spacing.sm }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={typography.body}>
                    {item.type === 'seat' ? 'Seat reservation' : 'Book reservation'}
                  </Text>
                  <Text style={typography.muted}>{formatDateTime(item.createdAt)}</Text>
                </View>
                <StatusBadge label={item.status} tone={STATUS_TONE[item.status] || 'neutral'} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, flexGrow: 1 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.textMuted, fontWeight: '600' },
  tabLabelActive: { color: colors.white },
  row: { flexDirection: 'row', alignItems: 'center' },
});
