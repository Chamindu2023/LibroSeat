import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllReservations, cancelReservation } from './adminService';
import { colors, spacing, typography, radius } from '../../theme/theme';
import { Card, PrimaryButton, StatusBadge, OutlineButton, EmptyState } from '../../components/UIKit';

export default function ManageReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchAllReservations();
    setReservations(data);
    setLoading(false);
  }

  const handleCancel = (id) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to revoke this reservation?",
      [
        { text: "No, keep it", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            const success = await cancelReservation(id);
            if (success) {
              loadData(); // Reload list to show updated status
            } else {
              Alert.alert("Error", "Failed to cancel the reservation.");
            }
          }
        }
      ]
    );
  };

  // Filter Logic
  const filteredData = reservations.filter(item => {
    if (filter === 'All Types') return true;
    if (filter === 'All') return true;
    if (filter === 'Active') return item.status === 'confirmed';
    if (filter === 'Overdue/Expired') return item.status === 'expired';
    if (filter === 'Unattended') return item.status === 'unattended';
    return true;
  });

  const FILTERS = ['All Types', 'Active', 'Overdue/Expired', 'Unattended'];

  const renderItem = ({ item }) => {
    const isBook = item.type === 'book';
    
    // Determine tone for the StatusBadge
    let tone = 'neutral';
    if (item.status === 'confirmed') tone = 'success';
    else if (item.status === 'expired' || item.status === 'cancelled') tone = 'danger';
    else if (item.status === 'unattended') tone = 'warning';
    
    // Format Date safely
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown Date';

    return (
      <Card style={styles.cardSpacing}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.patronName} numberOfLines={1}>{item.patronName}</Text>
            <Text style={styles.patronId}>{item.patronId}</Text>
          </View>
          <StatusBadge label={item.status.toUpperCase()} tone={tone} />
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.itemRow}>
            <Ionicons name={isBook ? "book-outline" : "business-outline"} size={16} color={colors.text} style={{marginRight: 6}} />
            <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        
        <View style={styles.actionRow}>
          {item.status !== 'cancelled' && (
            <OutlineButton 
              title="Cancel" 
              color={colors.danger} 
              onPress={() => handleCancel(item.id)} 
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Manage Reservations</Text>
      </View>
      
      {/* Filter Row */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 40}} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={<EmptyState message="No reservations found." />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  
  filterWrapper: { marginBottom: spacing.md },
  filterScroll: { paddingHorizontal: spacing.lg, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: colors.white },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  cardSpacing: { marginBottom: spacing.md },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  patronName: { fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 2 },
  patronId: { fontSize: 12, color: colors.textMuted },
  
  cardBody: { marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  dateText: { fontSize: 12, color: colors.textMuted },
  
  actionRow: { alignItems: 'flex-end', marginTop: spacing.sm },
});
