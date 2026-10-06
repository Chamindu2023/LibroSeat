// Screen: Notifications (list)
// Owned by: Nimnada (Home & Account Module) | Linked requirement: Survey Q12
// Fully implemented.

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';
import { Card, EmptyState } from '../../components/UIKit';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { subscribeToNotifications } from './accountService';
import { formatRelativeTime } from '../../hooks/formatDate';

const ICONS = {
  expiry: 'time-outline',
  confirmation: 'checkmark-circle-outline',
  pickup: 'book-outline',
  default: 'notifications-outline',
};

export default function NotificationsScreen({ navigation }) {
  const userId = useCurrentUserId();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, (items) => {
      setNotifications(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.container}
        data={notifications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? <EmptyState message="You have no notifications yet." /> : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('NotificationDetail', { notification: item })}>
            <Card style={!item.isRead && styles.unreadCard}>
              <View style={styles.row}>
                <Ionicons
                  name={ICONS[item.type] || ICONS.default}
                  size={22}
                  color={colors.primary}
                  style={{ marginRight: spacing.sm }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={typography.body} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={typography.muted}>{formatRelativeTime(item.createdAt)}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  unreadCard: { borderColor: colors.primary },
});
