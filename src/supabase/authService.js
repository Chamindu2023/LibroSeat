import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../supabase/supabaseConfig';

const USERS_KEY = 'libroseat.local.users';
const SESSION_KEY = 'libroseat.local.session';

async function readUsers() {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeUsers(users) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeLocalUid(email) {
  return `local-${email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

function publicUser(user) {
  if (!user) return null;
  return { uid: user.uid, email: user.email, role: user.role };
}

function normalizeAuthError(error, fallbackCode = 'auth/invalid-credential') {
  if (!error) return null;
  const message = `${error.message ?? ''}`.toLowerCase();
  if (message.includes('already registered') || message.includes('already exists')) {
    error.code = 'auth/email-already-in-use';
  } else if (message.includes('password')) {
    error.code = 'auth/weak-password';
  } else if (message.includes('invalid')) {
    error.code = 'auth/invalid-email';
  } else {
    error.code = fallbackCode;
  }
  return error;
}

async function getSupabaseProfile(user) {
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,role,full_name,student_id')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return {
    uid: user.id,
    email: data?.email ?? user.email,
    role: data?.role,
    fullName: data?.full_name,
    studentId: data?.student_id,
  };
}

export async function createStudentAccount({ fullName, studentId, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          role: 'student',
        },
      },
    });

    if (error) throw normalizeAuthError(error, 'auth/email-already-in-use');

    const user = data.user;
    if (!user) {
      const signupError = new Error('Could not create your account. Please try again.');
      signupError.code = 'auth/invalid-credential';
      throw signupError;
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      student_id: studentId,
      email: normalizedEmail,
      role: 'student',
    });

    if (profileError) throw profileError;
    return { uid: user.id, email: normalizedEmail, role: 'student' };
  }

  const users = await readUsers();
  if (users[normalizedEmail]) {
    const error = new Error('Email already exists');
    error.code = 'auth/email-already-in-use';
    throw error;
  }

  const user = {
    uid: makeLocalUid(normalizedEmail),
    fullName,
    studentId,
    email: normalizedEmail,
    password,
    role: 'student',
    createdAt: new Date().toISOString(),
  };
  users[normalizedEmail] = user;
  await writeUsers(users);
  await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
  return publicUser(user);
}

export async function signInStudent(email, password) {
  const user = await signInAccount(email, password);
  if (user.role !== 'student') {
    await signOutAccount();
    const error = new Error('Not a student account');
    error.code = 'auth/not-student';
    throw error;
  }
  return user;
}

export async function signInStaff(staffId, password) {
  const staffEmail = `${staffId.trim().toLowerCase()}@libroseat-staff.local`;
  const user = await signInAccount(staffEmail, password);
  if (user.role !== 'staff') {
    await signOutAccount();
    const error = new Error('Invalid staff account');
    error.code = 'auth/invalid-credential';
    throw error;
  }
  return user;
}

async function signInAccount(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw normalizeAuthError(error);
    return getSupabaseProfile(data.user);
  }

  const users = await readUsers();
  const user = users[normalizedEmail];
  if (!user || user.password !== password) {
    const error = new Error('Invalid credentials');
    error.code = 'auth/invalid-credential';
    throw error;
  }
  await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
  return publicUser(user);
}

export async function signOutAccount() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
    return;
  }
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function sendResetLink(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
    if (error) throw normalizeAuthError(error, 'auth/user-not-found');
    return;
  }

  const users = await readUsers();
  if (!users[normalizedEmail]) {
    const error = new Error('No local account');
    error.code = 'auth/user-not-found';
    throw error;
  }
}

export async function getCurrentSessionUser() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;
    return getSupabaseProfile(data.session.user);
  }

  const email = await AsyncStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const users = await readUsers();
  return publicUser(users[email]);
}

export function subscribeToSession(callback) {
  if (isSupabaseConfigured) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      getSupabaseProfile(session.user)
        .then(callback)
        .catch(() => callback(null));
    });
    return () => data.subscription.unsubscribe();
  }

  let active = true;
  getCurrentSessionUser().then((user) => {
    if (active) callback(user);
  });
  return () => {
    active = false;
  };
}
