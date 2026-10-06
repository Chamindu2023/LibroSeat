import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, OutlineButton, PrimaryButton, StatusBadge } from '../../components/UIKit';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { isSupabaseConfigured } from '../../supabase/supabaseConfig';
import {
  deletePaymentMethod,
  savePaymentMethod,
  setDefaultPaymentMethod,
  subscribeToPaymentMethods,
} from './paymentService';

function formatExpiry(month, year) {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
}

export default function PaymentDetailsScreen() {
  const userId = useCurrentUserId();
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setMethods([]);
      return undefined;
    }
    return subscribeToPaymentMethods(userId, setMethods);
  }, [userId]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await savePaymentMethod(userId, form);
      setForm({ cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
    } catch (e) {
      setError(e.message || 'Could not save this card.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (method) => {
    Alert.alert('Remove card', `Remove ${method.brand} ending in ${method.last4}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deletePaymentMethod(userId, method.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {!isSupabaseConfigured ? (
            <Card>
              <Text style={typography.body}>Supabase is not connected yet.</Text>
              <Text style={[typography.muted, styles.note]}>
                Paste your Project URL and anon key into src/supabase/supabaseConfig.js, then run the
                SQL in supabase.schema.sql from the Supabase SQL Editor.
              </Text>
            </Card>
          ) : null}

          <Text style={typography.subtitle}>Saved cards</Text>
          {methods.length ? (
            methods.map((method) => (
              <Card key={method.id}>
                <View style={styles.methodHeader}>
                  <View>
                    <Text style={typography.body}>
                      {method.brand} •••• {method.last4}
                    </Text>
                    <Text style={typography.muted}>
                      {method.cardholderName} · Exp {formatExpiry(method.expiryMonth, method.expiryYear)}
                    </Text>
                  </View>
                  {method.isDefault ? <StatusBadge label="Default" tone="success" /> : null}
                </View>
                <View style={styles.methodActions}>
                  {!method.isDefault ? (
                    <OutlineButton title="Set default" onPress={() => setDefaultPaymentMethod(userId, method.id)} />
                  ) : null}
                  <OutlineButton title="Remove" color={colors.danger} onPress={() => handleDelete(method)} />
                </View>
              </Card>
            ))
          ) : (
            <Text style={typography.muted}>No payment methods saved yet.</Text>
          )}

          <Text style={[typography.subtitle, styles.section]}>Add a card</Text>
          <Text style={typography.muted}>
            Full card number and CVV stay on this device. Only name, brand, last 4 digits, and expiry
            are stored in Supabase.
          </Text>

          <Field placeholder="Name on card" value={form.cardholderName} onChangeText={(v) => setField('cardholderName', v)} />
          <Field
            placeholder="Card number"
            value={form.cardNumber}
            onChangeText={(v) => setField('cardNumber', v.replace(/[^\d ]/g, ''))}
            keyboardType="number-pad"
            maxLength={19}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                placeholder="MM"
                value={form.expiryMonth}
                onChangeText={(v) => setField('expiryMonth', v.replace(/\D/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.flex}>
              <Field
                placeholder="YYYY"
                value={form.expiryYear}
                onChangeText={(v) => setField('expiryYear', v.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <View style={styles.flex}>
              <Field
                placeholder="CVV"
                value={form.cvv}
                onChangeText={(v) => setField('cvv', v.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="Save card" onPress={handleSave} loading={saving} disabled={!userId || saving} />

          <View style={styles.hintRow}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
            <Text style={[typography.muted, styles.flex]}>CVV is used only to validate the form and is never saved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  note: { marginTop: spacing.xs },
  section: { marginTop: spacing.md },
  methodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  methodActions: { gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.card,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 13 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
});
