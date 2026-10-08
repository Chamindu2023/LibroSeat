import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme/theme';
import { fetchSeatsData, releaseSeat } from './adminService';

export default function SeatAllocationScreen({ navigation }) {
  const [autoRelease, setAutoRelease] = useState(true);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    loadSeats();
  }, []);

  async function loadSeats() {
    setLoading(true);
    const data = await fetchSeatsData();
    setSeats(data);
    
    // Auto-select B3 if it exists in mock data to match screenshot
    const b3 = data.find(s => s.label === 'B3');
    if (b3 && b3.status === 'unattended') {
      setSelectedSeat(b3);
    }
    setLoading(false);
  }

  const handleRelease = (seatId) => {
    Alert.alert("Release Carrel", "Are you sure you want to release this seat? The patron's reservation will be cancelled.", [
      { text: "Cancel", style: "cancel" },
      { text: "Release", style: "destructive", onPress: async () => {
        await releaseSeat(seatId);
        setSelectedSeat(null);
        loadSeats();
      }}
    ]);
  };

  const getSeatStyle = (status) => {
    switch (status) {
      case 'occupied': return styles.seatOccupied;
      case 'unattended': return styles.seatUnattended;
      case 'reserved': return styles.seatReserved;
      case 'free':
      default: return styles.seatFree;
    }
  };

  const getSeatIcon = (status) => {
    switch (status) {
      case 'occupied': return <Ionicons name="person" size={14} color="#FFF" />;
      case 'reserved': return <Ionicons name="bookmark-outline" size={14} color="#14B8A6" />;
      case 'free': return <Ionicons name="ellipse-outline" size={14} color="#64748B" />;
      case 'unattended': return null;
    }
  };

  const freeCount = seats.filter(s => s.status === 'free').length;
  const occupiedCount = seats.filter(s => s.status === 'occupied').length;
  const idleCount = seats.filter(s => s.status === 'unattended').length;
  const reservedCount = seats.filter(s => s.status === 'reserved').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <View style={styles.appIconBg}>
            <Ionicons name="book" size={18} color="#1E40AF" />
          </View>
          <View>
            <Text style={styles.staffPortalText}>STAFF PORTAL</Text>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <Ionicons name="search" size={20} color="#64748B" style={{marginRight: 16}} />
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={14} color="#FFF" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Node Badge */}
        <View style={styles.nodeHeaderRow}>
          <View style={styles.nodePill}>
            <View style={styles.dotTeal} />
            <Text style={styles.nodePillText}>STAFF NODE • ZONE A</Text>
          </View>
          <TouchableOpacity style={styles.optionsBtn}>
            <Ionicons name="options-outline" size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>Seat Allocation Settings</Text>
        <Text style={styles.subTitle}>Real-time carrel occupancy rules and zone layout</Text>

        {/* Settings Card */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.clockIconBg}>
                <Ionicons name="time-outline" size={16} color="#0D9488" />
              </View>
              <View style={{marginLeft: 10}}>
                <Text style={styles.settingTitle}>Auto-Release Idle Seats</Text>
                <Text style={styles.settingSub}>Automated grace and buffer checks</Text>
              </View>
            </View>
            <Switch 
              value={autoRelease} 
              onValueChange={setAutoRelease} 
              trackColor={{ false: '#CBD5E1', true: '#0D9488' }} 
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="scan-circle-outline" size={16} color="#0D9488" style={{marginRight: 8}} />
              <Text style={styles.settingRowLabel}>Release buffer threshold</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.settingRowValue}>30 min</Text>
              <View style={styles.upDownArrows}>
                <Ionicons name="chevron-up" size={10} color="#64748B" />
                <Ionicons name="chevron-down" size={10} color="#64748B" />
              </View>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="timer-outline" size={16} color="#0D9488" style={{marginRight: 8}} />
              <Text style={styles.settingRowLabel}>Check-in grace period</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.settingRowValue}>15 min</Text>
              <View style={styles.upDownArrows}>
                <Ionicons name="chevron-up" size={10} color="#64748B" />
                <Ionicons name="chevron-down" size={10} color="#64748B" />
              </View>
            </View>
          </View>

          <View style={styles.alertBox}>
            <Ionicons name="notifications-outline" size={16} color="#0D9488" />
            <Text style={styles.alertText}>Automated alert dispatched via SMS/Email 5m prior to revocation.</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxFree]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#0D9488" style={{marginRight: 4}} />
              <Text style={styles.statLabelFree}>FREE</Text>
            </View>
            <Text style={styles.statValue}>{freeCount < 10 ? `0${freeCount}` : freeCount}</Text>
          </View>
          
          <View style={[styles.statBox, styles.statBoxOccupied]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              <Ionicons name="person-outline" size={14} color="#475569" style={{marginRight: 4}} />
              <Text style={styles.statLabelOccupied}>OCCUPIED</Text>
            </View>
            <Text style={styles.statValue}>{occupiedCount < 10 ? `0${occupiedCount}` : occupiedCount}</Text>
          </View>
          
          <View style={[styles.statBox, styles.statBoxIdle]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              <Ionicons name="time-outline" size={14} color="#D97706" style={{marginRight: 4}} />
              <Text style={styles.statLabelIdle}>IDLE</Text>
            </View>
            <Text style={styles.statValueIdle}>{idleCount < 10 ? `0${idleCount}` : idleCount}</Text>
          </View>
        </View>

        {/* Grid Header */}
        <View style={styles.gridHeaderRow}>
          <Text style={styles.gridHeaderTitle}>Reading Room • Level 2 Grid</Text>
          <Text style={styles.gridHeaderSub}>Zone A (Carrels)</Text>
        </View>

        <View style={styles.statusPillsRow}>
          <View style={styles.statusPill}><View style={[styles.dot, {backgroundColor: '#0D9488'}]}/><Text style={styles.statusPillText}>Free ({freeCount})</Text></View>
          <View style={styles.statusPill}><View style={[styles.dot, {backgroundColor: '#0F766E'}]}/><Text style={styles.statusPillText}>Occupied ({occupiedCount})</Text></View>
          <View style={[styles.statusPill, {borderColor: '#FECACA', backgroundColor: '#FEF2F2'}]}>
            <View style={[styles.dot, {backgroundColor: '#EF4444'}]}/>
            <Text style={[styles.statusPillText, {color: '#EF4444'}]}>Unattended ({idleCount})</Text>
          </View>
          <View style={[styles.statusPill, {borderColor: '#CCFBF1', backgroundColor: '#F0FDFA'}]}>
            <View style={[styles.dot, {backgroundColor: '#14B8A6'}]}/>
            <Text style={[styles.statusPillText, {color: '#0D9488'}]}>Reserved ({reservedCount})</Text>
          </View>
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator size="large" color="#0D9488" style={{marginVertical: 40}} />
        ) : (
          <View style={styles.gridContainer}>
            {seats.map(seat => (
              <TouchableOpacity 
                key={seat.id} 
                style={[
                  styles.seatSquare, 
                  getSeatStyle(seat.status),
                  selectedSeat?.id === seat.id && styles.seatSelected
                ]}
                onPress={() => setSelectedSeat(seat)}
              >
                {seat.status === 'unattended' && <View style={styles.redDotCorner} />}
                <Text style={[styles.seatLabel, seat.status === 'occupied' && {color: '#FFF'}, seat.status === 'unattended' && {color: '#991B1B'}]}>
                  {seat.label}
                </Text>
                
                {seat.status === 'unattended' ? (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.idleTimeText}>{seat.idleMinutes}m</Text>
                    <Ionicons name="time-outline" size={10} color="#EF4444" style={{marginLeft: 2}} />
                  </View>
                ) : (
                  getSeatIcon(seat.status)
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Seat Details */}
        {selectedSeat && selectedSeat.status === 'unattended' && (
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.carrelIconBg}>
                  <MaterialCommunityIcons name="desk" size={18} color="#0D9488" />
                </View>
                <View style={{marginLeft: 12}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.detailsTitle}>Carrel {selectedSeat.label.replace(/([A-Z])(\d)/, '$1-0$2')}</Text>
                    <View style={styles.quietZonePill}>
                      <Text style={styles.quietZoneText}>Quiet Zone</Text>
                    </View>
                  </View>
                  <Text style={styles.patronText}>Patron: {selectedSeat.patronName} ({selectedSeat.patronId})</Text>
                </View>
              </View>
              <View style={styles.unattendedPill}>
                <View style={styles.dotRed} />
                <Text style={styles.unattendedPillText}>Unattended - {selectedSeat.idleMinutes}m</Text>
              </View>
            </View>

            <View style={styles.sessionRow}>
              <View style={styles.sessionBoxLeft}>
                <Text style={styles.sessionLabel}>SESSION STARTED</Text>
                <Text style={styles.sessionValue}>13:42 <Text style={{fontWeight: '400'}}>(1h 18m)</Text></Text>
              </View>
              <View style={styles.sessionBoxRight}>
                <Text style={styles.sessionLabelOrange}>AUTO-RELEASE CLOCK</Text>
                <Text style={styles.sessionValueOrange}>T - 04m remaining</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.pingBtn}>
                <Ionicons name="notifications-outline" size={16} color="#0D9488" style={{marginRight: 6}} />
                <Text style={styles.pingBtnText}>Ping Patron</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.releaseBtn} onPress={() => handleRelease(selectedSeat.id)}>
                <Ionicons name="log-out-outline" size={16} color="#FFF" style={{marginRight: 6}} />
                <Text style={styles.releaseBtnText}>Release Carrel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#64748B" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManageInventory')}>
          <MaterialCommunityIcons name="archive-outline" size={24} color="#64748B" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ManageReservations')}>
          <MaterialCommunityIcons name="calendar-check-outline" size={24} color="#64748B" />
          <Text style={styles.navText}>Reservations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="sofa-single" size={24} color="#14B8A6" />
          <Text style={[styles.navText, { color: '#14B8A6' }]}>Seats</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: '#FFF' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  staffPortalText: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },
  dashboardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  profileIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.md },
  
  nodeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  nodePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  dotTeal: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9488' },
  nodePillText: { fontSize: 11, fontWeight: '700', color: '#0D9488', letterSpacing: 0.5 },
  optionsBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  mainTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  subTitle: { fontSize: 13, color: '#64748B', marginBottom: spacing.lg },

  settingsCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: spacing.md, borderWidth: 1, borderColor: '#F1F5F9' },
  settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  clockIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  settingSub: { fontSize: 12, color: '#94A3B8' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 8 },
  settingRowLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  settingRowValue: { fontSize: 13, fontWeight: '700', color: '#1E293B', fontFamily: 'monospace', marginRight: 8 },
  upDownArrows: { alignItems: 'center', justifyContent: 'center' },
  
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDFA', padding: 10, borderRadius: 8, gap: 8, marginTop: 8 },
  alertText: { flex: 1, fontSize: 11, color: '#0F766E' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.lg },
  statBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  statBoxFree: { borderTopWidth: 3, borderTopColor: '#0D9488' },
  statBoxOccupied: { borderTopWidth: 3, borderTopColor: '#475569' },
  statBoxIdle: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB', borderTopWidth: 3, borderTopColor: '#F59E0B' },
  statLabelFree: { fontSize: 11, fontWeight: '700', color: '#0D9488', letterSpacing: 0.5 },
  statLabelOccupied: { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 0.5 },
  statLabelIdle: { fontSize: 11, fontWeight: '700', color: '#D97706', letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statValueIdle: { fontSize: 20, fontWeight: '800', color: '#D97706' },

  gridHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  gridHeaderSub: { fontSize: 12, color: '#64748B', fontFamily: 'monospace' },

  statusPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: '600', color: '#475569' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.xl },
  seatSquare: { width: '22%', aspectRatio: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1 },
  seatFree: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  seatOccupied: { backgroundColor: '#115E59', borderColor: '#115E59' },
  seatReserved: { backgroundColor: '#CCFBF1', borderColor: '#14B8A6' },
  seatUnattended: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  seatSelected: { transform: [{ scale: 1.05 }], shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  redDotCorner: { position: 'absolute', top: -4, right: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFF' },
  seatLabel: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  idleTimeText: { fontSize: 10, fontWeight: '700', color: '#EF4444' },

  detailsCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: spacing.xl, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4 },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  carrelIconBg: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' },
  detailsTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginRight: 8 },
  quietZonePill: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  quietZoneText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  patronText: { fontSize: 13, color: '#64748B', marginTop: 4, fontFamily: 'monospace' },
  unattendedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, gap: 4 },
  dotRed: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  unattendedPillText: { fontSize: 11, fontWeight: '700', color: '#991B1B' },

  sessionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sessionBoxLeft: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 },
  sessionBoxRight: { flex: 1, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8 },
  sessionLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 4 },
  sessionValue: { fontSize: 13, fontWeight: '700', color: '#1E293B', fontFamily: 'monospace' },
  sessionLabelOrange: { fontSize: 10, fontWeight: '800', color: '#D97706', letterSpacing: 0.5, marginBottom: 4 },
  sessionValueOrange: { fontSize: 13, fontWeight: '700', color: '#B45309', fontFamily: 'monospace' },

  actionRow: { flexDirection: 'row', gap: 12 },
  pingBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#0D9488', height: 44, borderRadius: 6 },
  pingBtnText: { fontSize: 13, fontWeight: '700', color: '#0D9488' },
  releaseBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DC2626', height: 44, borderRadius: 6 },
  releaseBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 12, paddingBottom: 24, position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { alignItems: 'center', gap: 4 },
  navText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
});
