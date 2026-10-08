import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { signOutAccount } from '../../supabase/authService';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';
import { isSupabaseConfigured, supabase } from '../../supabase/supabaseConfig';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { fetchBooks } from './adminService';

export default function AdminDashboardScreen({ navigation }) {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeHolds: 0,
    pendingPickup: 0,
    unattendedSeats: 0,
    totalSeats: 0,
    occupiedSeats: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const localBooks = await fetchBooks();
        
        let dbStats = {
          activeHolds: 0,
          pendingPickup: 0,
          unattendedSeats: 0,
          totalSeats: 0,
          occupiedSeats: 0,
        };

        if (isSupabaseConfigured) {
          try {
            const [activeHoldsRes, pendingHoldsRes, seatsRes, occupiedSeatsRes, unattendedSeatsRes] = await Promise.all([
              supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('type', 'book').eq('status', 'confirmed'),
              supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('type', 'book').eq('status', 'pending'),
              supabase.from('seats').select('*', { count: 'exact', head: true }),
              supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'occupied'),
              supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'unattended'),
            ]);
            dbStats = {
              activeHolds: activeHoldsRes.count || 0,
              pendingPickup: pendingHoldsRes.count || 0,
              unattendedSeats: unattendedSeatsRes.count || 0,
              totalSeats: seatsRes.count || 0,
              occupiedSeats: occupiedSeatsRes.count || 0,
            };
          } catch(e) {}
        }
        
        setStats({
          totalBooks: localBooks.length,
          ...dbStats
        });
      } catch (err) {
        console.warn('Error loading admin stats:', err);
      }
    }
    
    // Refresh the numbers every time the user navigates back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    
    // Initial load
    loadStats();
    
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    setLogoutVisible(false);
    await signOutAccount();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="cube-scan" size={28} color={colors.primary} />
          <View style={styles.logoTextContainer}>
            <Text style={styles.staffPortalText}>STAFF PORTAL</Text>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Ionicons name="search-outline" size={24} color="#64748B" /></TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}><MaterialCommunityIcons name="barcode-scan" size={24} color="#64748B" /></TouchableOpacity>
          <TouchableOpacity style={styles.profileIcon} onPress={() => setLogoutVisible(true)}>
            <Ionicons name="person" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STATUS INDICATOR */}
        <View style={styles.statusIndicator}>
          <View style={styles.statusLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>MAIN LIBRARY • DESK ACTIVE</Text>
          </View>
          <Text style={styles.shiftText}>Shift: 08:00 - 16:30</Text>
        </View>

        {/* WELCOME */}
        <Text style={styles.welcomeTitle}>Welcome back, Staff</Text>
        <Text style={styles.welcomeSub}>Here's what's happening today across circulation and floor bays.</Text>

        {/* HOLDINGS REPOSITORY CARD */}
        <View style={styles.holdingsCard}>
          <View style={styles.holdingsHeader}>
            <Ionicons name="book-outline" size={16} color={colors.white} />
            <Text style={styles.holdingsTitle}>HOLDINGS REPOSITORY</Text>
            <Ionicons name="book" size={80} color="rgba(255,255,255,0.15)" style={styles.bgIcon} />
          </View>
          <View style={styles.holdingsStats}>
            <Text style={styles.holdingsNumber}>{stats.totalBooks}</Text>
            <Text style={styles.holdingsLabel}>Total Books</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.holdingsFooter}>
            <View style={styles.holdingsFooterLeft}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.white} />
              <Text style={styles.holdingsFooterText}>94% cataloged & shelved</Text>
            </View>
            <View style={styles.badgeDark}>
              <Text style={styles.badgeDarkText}>14 out today</Text>
            </View>
          </View>
        </View>

        {/* ROW CARDS */}
        <View style={styles.rowCards}>
          <View style={[styles.smallCard, { backgroundColor: '#F0F9F9' }]}>
            <View style={styles.smallCardHeader}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={[styles.tag, { backgroundColor: '#D4EFEF' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>Queue</Text>
              </View>
            </View>
            <Text style={styles.smallCardNum}>{stats.activeHolds}</Text>
            <Text style={styles.smallCardTitle}>Active holds</Text>
            <Text style={[styles.smallCardSub, { color: colors.primary }]}>{stats.pendingPickup} pending pickup</Text>
          </View>
          
          <View style={[styles.smallCard, { backgroundColor: '#FCEAE8' }]}>
            <View style={styles.smallCardHeader}>
              <MaterialCommunityIcons name="sofa-single-outline" size={20} color={colors.danger} />
              <View style={[styles.tag, { backgroundColor: '#FAD4D4' }]}>
                <Text style={[styles.tagText, { color: colors.danger, fontWeight: '700' }]}>!Alert</Text>
              </View>
            </View>
            <Text style={[styles.smallCardNum, { color: colors.danger }]}>{stats.unattendedSeats}</Text>
            <Text style={[styles.smallCardTitle, { color: colors.danger }]}>Unattended seats</Text>
            <Text style={[styles.smallCardSub, { color: colors.danger }]}>{'>'} 30m idle session</Text>
          </View>
        </View>

        {/* FLOOR DENSITY */}
        <View style={styles.densityCard}>
          <View style={styles.densityHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pie-chart-outline" size={18} color="#4A5568" />
              <Text style={styles.sectionTitle}>Floor Density Real-Time</Text>
            </View>
            <Text style={styles.densityRightText}>Level 2 Stacks</Text>
          </View>
          <View style={styles.densityBody}>
            <View style={styles.donut}>
              <Text style={styles.donutText}>{Math.round((stats.occupiedSeats / Math.max(stats.totalSeats, 1)) * 100)}%</Text>
            </View>
            <View style={styles.densityInfo}>
              <View style={styles.densityInfoTop}>
                <Text style={styles.densityCount}>Reading Carrels: {stats.occupiedSeats} / {stats.totalSeats}</Text>
                <Text style={styles.densityStatus}>Healthy</Text>
              </View>
              <View style={styles.densityLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>Quiet Zone</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
                  <Text style={styles.legendText}>Collab Bay</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actionsHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.densityRightText}>Desk Utilities</Text>
        </View>
        
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ManageInventory')}>
          <View style={styles.actionIconBg}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.actionTexts}>
            <Text style={styles.actionTitle}>Manage inventory</Text>
            <Text style={styles.actionSub}>Browse catalog, check-in & stock</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ManageReservations')}>
          <View style={styles.actionIconBg}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.actionTexts}>
            <Text style={styles.actionTitle}>Manage reservations</Text>
            <Text style={styles.actionSub}>Review active holds & patron requests</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('SeatAllocation')}>
          <View style={styles.actionIconBg}>
            <MaterialCommunityIcons name="sofa-single-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.actionTexts}>
            <Text style={styles.actionTitle}>Seat allocation</Text>
            <Text style={styles.actionSub}>Reading room carrels & occupancy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* DESK ACTIVITY FEED */}
        <View style={[styles.actionsHeader, { marginTop: spacing.sm }]}>
          <Text style={styles.feedTitle}>DESK ACTIVITY FEED</Text>
          <Text style={styles.feedRight}>Auto-sync</Text>
        </View>
        
        <View style={styles.feedItem}>
          <View style={[styles.feedDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.feedText} numberOfLines={1}>Return: "Principles of Quantum Mechanics"</Text>
          <Text style={styles.feedTime}>2m ago</Text>
        </View>
        <View style={styles.feedItem}>
          <View style={[styles.feedDot, { backgroundColor: '#94A3B8' }]} />
          <Text style={styles.feedText} numberOfLines={1}>Seat C-12 vacated by Patron #4409</Text>
          <Text style={styles.feedTime}>14m ago</Text>
        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={colors.primary} />
          <Text style={[styles.navText, { color: colors.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManageInventory')}>
          <MaterialCommunityIcons name="archive-outline" size={24} color="#64748B" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManageReservations')}>
          <MaterialCommunityIcons name="calendar-check-outline" size={24} color="#64748B" />
          <Text style={styles.navText}>Reservations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SeatAllocation')}>
          <MaterialCommunityIcons name="sofa-single-outline" size={24} color="#64748B" />
          <Text style={styles.navText}>Seats</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoTextContainer: { flexDirection: 'column' },
  staffPortalText: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  dashboardTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  
  statusIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  statusText: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  shiftText: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  welcomeSub: { fontSize: 14, color: '#64748B', marginBottom: spacing.lg, lineHeight: 20 },

  holdingsCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  holdingsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, zIndex: 1 },
  holdingsTitle: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bgIcon: { position: 'absolute', right: -20, top: -10, opacity: 0.2 },
  holdingsStats: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16, zIndex: 1 },
  holdingsNumber: { color: colors.white, fontSize: 36, fontWeight: '800' },
  holdingsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '500' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 16 },
  progressBarFill: { width: '94%', height: '100%', backgroundColor: colors.white, borderRadius: 3 },
  holdingsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  holdingsFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  holdingsFooterText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  badgeDark: { backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeDarkText: { color: colors.white, fontSize: 10, fontWeight: '700' },

  rowCards: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  smallCard: { flex: 1, borderRadius: radius.lg, padding: 16 },
  smallCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '800' },
  smallCardNum: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  smallCardTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  smallCardSub: { fontSize: 11, fontWeight: '700' },

  densityCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  densityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  densityRightText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  densityBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  donut: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  donutText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  densityInfo: { flex: 1 },
  densityInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  densityCount: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  densityStatus: { fontSize: 12, fontWeight: '700', color: colors.primary },
  densityLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  actionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  actionRow: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  actionIconBg: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionTexts: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  actionSub: { fontSize: 13, color: '#64748B' },

  feedTitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  feedRight: { fontSize: 10, fontWeight: '800', color: colors.primary },
  feedItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  feedDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  feedText: { flex: 1, fontSize: 13, color: '#1E293B', fontWeight: '500' },
  feedTime: { fontSize: 11, color: '#94A3B8', marginLeft: 8 },

  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white, paddingBottom: 20, paddingTop: 12, position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'space-around' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: '700', color: '#64748B', marginTop: 4 },
});
