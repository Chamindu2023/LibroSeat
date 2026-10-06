import React, { useRef, useState } from 'react';
import {
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
import { signInStudent } from '../../supabase/authService';
import { OutlineButton, PrimaryButton } from '../../components/UIKit';
import { colors, radius, spacing, typography } from '../../theme/theme';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyLoginError(code) {
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(code)) {
    return 'Incorrect email or password. Please try again.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts - please wait a moment and try again.';
  }
  return 'Could not log in. Please try again.';
}

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password || !emailPattern.test(email.trim())) {
      setError('Enter your student email and password to continue.');
      runShake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInStudent(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setError(e.code === 'auth/not-student' ? 'This account is not registered as a student. Try Staff Login instead.' : friendlyLoginError(e.code));
      runShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue as a student</Text>

          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <Field
              icon="mail-outline"
              placeholder="Student Email or ID"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordHeader}>
              <Text style={styles.passwordLabel}>Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.link}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <Field
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightPress={() => setShowPassword((current) => !current)}
            />
          </Animated.View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Log In" onPress={handleSubmit} disabled={loading} loading={loading} />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <OutlineButton title="Log in as Admin" onPress={() => navigation.navigate('StaffLogin')} disabled={loading} />

          <Text style={styles.footer}>
            Don't have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
              Sign Up
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  passwordLabel: { ...typography.muted, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 13 },
  link: { color: colors.primary, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { ...typography.muted },
  footer: { ...typography.muted, textAlign: 'center', marginTop: spacing.sm },
});
