import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, OutlineButton, PrimaryButton } from '../../components/UIKit';
import { colors, spacing, typography } from '../../theme/theme';

export default function RoleSelectionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to LibroSeat</Text>
        <Text style={styles.subtitle}>Reserve library books and book reading-room seats, all in one place.</Text>

        <Card style={styles.roleCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="school-outline" size={28} color={colors.primary} />
          </View>
          <Text style={typography.subtitle}>Student</Text>
          <Text style={styles.muted}>Search books & book seats</Text>
          <View style={styles.row}>
            <View style={styles.buttonHalf}>
              <PrimaryButton title="Log In" onPress={() => navigation.navigate('Login')} />
            </View>
            <View style={styles.buttonHalf}>
              <OutlineButton title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
            </View>
          </View>
        </Card>

        <Card style={styles.roleCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
          </View>
          <Text style={typography.subtitle}>Library Staff</Text>
          <Text style={styles.muted}>Manage reservations & inventory</Text>
          <PrimaryButton title="Log In" onPress={() => navigation.navigate('StaffLogin')} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { ...typography.title, fontSize: 28 },
  subtitle: { ...typography.muted, fontSize: 15, lineHeight: 22, marginBottom: spacing.sm },
  roleCard: { gap: spacing.sm },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '14',
  },
  muted: { ...typography.muted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  buttonHalf: { flex: 1 },
});
