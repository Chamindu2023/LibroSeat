import { isSupabaseConfigured, supabase } from '../../supabase/supabaseConfig';

function mapPaymentMethod(row) {
  return {
    id: row.id,
    userId: row.user_id,
    cardholderName: row.cardholder_name,
    brand: row.brand,
    last4: row.last4,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

export function detectCardBrand(cardNumber) {
  const digits = `${cardNumber}`.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6/.test(digits)) return 'Discover';
  return 'Card';
}

export function luhnCheck(cardNumber) {
  const digits = `${cardNumber}`.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

async function fetchPaymentMethods(userId, callback) {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('fetchPaymentMethods error:', error.message);
    callback([]);
    return;
  }
  callback((data ?? []).map(mapPaymentMethod));
}

export function subscribeToPaymentMethods(userId, callback) {
  if (!isSupabaseConfigured || !userId) {
    callback([]);
    return () => {};
  }

  fetchPaymentMethods(userId, callback);
  const channel = supabase
    .channel(`payment_methods:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'payment_methods', filter: `user_id=eq.${userId}` },
      () => fetchPaymentMethods(userId, callback)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function savePaymentMethod(userId, { cardholderName, cardNumber, expiryMonth, expiryYear, cvv }) {
  if (!isSupabaseConfigured) {
    const error = new Error('Supabase is not configured yet.');
    error.code = 'config/missing';
    throw error;
  }

  const digits = `${cardNumber}`.replace(/\D/g, '');
  const month = Number(expiryMonth);
  const year = Number(expiryYear);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (!cardholderName?.trim()) {
    throw Object.assign(new Error('Cardholder name is required.'), { code: 'payment/invalid' });
  }
  if (!luhnCheck(digits)) {
    throw Object.assign(new Error('Enter a valid card number.'), { code: 'payment/invalid' });
  }
  if (!/^\d{3,4}$/.test(`${cvv ?? ''}`)) {
    throw Object.assign(new Error('Enter a valid CVV.'), { code: 'payment/invalid' });
  }
  if (!month || month < 1 || month > 12 || !year || year < currentYear) {
    throw Object.assign(new Error('Enter a valid expiry date.'), { code: 'payment/invalid' });
  }
  if (year === currentYear && month < currentMonth) {
    throw Object.assign(new Error('This card has expired.'), { code: 'payment/invalid' });
  }

  const { data: existing, error: existingError } = await supabase
    .from('payment_methods')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existingError) throw existingError;

  const { error } = await supabase.from('payment_methods').insert({
    user_id: userId,
    cardholder_name: cardholderName.trim(),
    brand: detectCardBrand(digits),
    last4: digits.slice(-4),
    expiry_month: month,
    expiry_year: year,
    is_default: !existing?.length,
  });

  if (error) throw error;
}

export async function setDefaultPaymentMethod(userId, paymentMethodId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
  await supabase.from('payment_methods').update({ is_default: true }).eq('id', paymentMethodId).eq('user_id', userId);
}

export async function deletePaymentMethod(userId, paymentMethodId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('payment_methods').delete().eq('id', paymentMethodId).eq('user_id', userId);
}
