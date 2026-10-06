import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createStudentAccount } from '../../supabase/authService';
import { PrimaryButton } from '../../components/UIKit';
import { colors, radius, spacing, typography } from '../../theme/theme';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlySignUpError(code) {
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
  if (code === 'auth/invalid-email') return 'Enter a valid email address.';
  return 'Could not create your account. Please try again.';
}

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ fullName: '', studentId: '', email: '', password: '' });
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const isValid = useMemo(
    () =>
      form.fullName.trim() &&
      form.studentId.trim() &&
      emailPattern.test(form.email.trim()) &&
      form.password.length >= 6 &&
      accepted,
    [accepted, form]
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.studentId.trim()) return 'Student ID is required.';
    if (!emailPattern.test(form.email.trim())) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (!accepted) return 'Please agree to the Terms & Conditions and Privacy Policy.';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      runShake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createStudentAccount({
        fullName: form.fullName.trim(),
        studentId: form.studentId.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setError(friendlySignUpError(e.code));
      runShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start reserving books & seats</Text>

          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <Field icon="person-outline" placeholder="Full Name" value={form.fullName} onChangeText={(v) => setField('fullName', v)} />
            <Field icon="id-card-outline" placeholder="Student ID" value={form.studentId} onChangeText={(v) => setField('studentId', v)} />
            <Field
              icon="mail-outline"
              placeholder="Email"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Password"
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightPress={() => setShowPassword((current) => !current)}
            />
          </Animated.View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAccepted((current) => !current)}>
            <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
              {accepted ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
            </View>
            <Text style={styles.terms}>
              I agree to the{' '}
              <Text style={styles.link} onPress={() => Alert.alert('Terms & Conditions', 'Placeholder content.')}>
                Terms & Conditions
              </Text>{' '}
              and{' '}
              <Text style={styles.link} onPress={() => Alert.alert('Privacy Policy', 'Placeholder content.')}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Sign Up" onPress={handleSubmit} disabled={!isValid || loading} loading={loading} />

          <Text style={styles.footer}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Log In
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ icon, rightIcon, onRightPress, ...props }) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress}>
          <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { ...typography.title, fontSize: 28 },
  subtitle: { ...typography.muted, fontSize: 15, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  input: { flex: 1, paddingVertical: 14, color: colors.text },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  terms: { ...typography.muted, flex: 1, lineHeight: 20 },
  link: { color: colors.primary, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 13 },
  footer: { ...typography.muted, textAlign: 'center', marginTop: spacing.sm },
});
