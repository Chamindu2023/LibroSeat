import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOutAccount } from '../../supabase/authService';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';
import { Card, OutlineButton, PrimaryButton } from '../../components/UIKit';
import { colors, radius, spacing, typography } from '../../theme/theme';

export default function AdminDashboardScreen({ navigation }) {
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutVisible(false);
    await signOutAccount();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.badge}>ADMIN</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setLogoutVisible(true)}>
            <Ionicons name="log-out-outline" size={23} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={typography.subtitle}>Circulation & Holdings</Text>
          <Text style={typography.muted}>Manage inventory, reservations, and reading-room seat allocation.</Text>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton title="Manage Inventory" onPress={() => navigation.navigate('ManageInventory')} />
          <PrimaryButton title="Manage Reservations" onPress={() => navigation.navigate('ManageReservations')} />
          <OutlineButton title="Seat Allocation Settings" onPress={() => navigation.navigate('SeatAllocation')} />
        </View>
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutVisible}
        title="Log Out"
        message="Are you sure you want to log out of the Admin Portal?"
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  title: { ...typography.title, fontSize: 26 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.lg,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: colors.primary + '14',
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
  summaryCard: { gap: spacing.xs, marginBottom: spacing.md },
  actions: { gap: spacing.sm },
});
