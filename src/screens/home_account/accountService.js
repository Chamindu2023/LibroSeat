import { isSupabaseConfigured, supabase } from '../../supabase/supabaseConfig';

function mapReservation(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    refId: row.ref_id,
    status: row.status,
    createdAt: row.created_at,
    ...row,
  };
}

function mapNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    ...row,
  };
}

async function fetchNotifications(userId, callback) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchNotifications error:', error.message);
    callback([]);
    return;
  }
  callback((data ?? []).map(mapNotification));
}

async function fetchReservations(userId, callback) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchReservations error:', error.message);
    callback([]);
    return;
  }
  callback((data ?? []).map(mapReservation));
}

export function subscribeToNotifications(userId, callback) {
  if (!isSupabaseConfigured || !userId) {
    callback([]);
    return () => {};
  }

  fetchNotifications(userId, callback);
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      () => fetchNotifications(userId, callback)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToReservations(userId, callback) {
  if (!isSupabaseConfigured || !userId) {
    callback([]);
    return () => {};
  }

  fetchReservations(userId, callback);
  const channel = supabase
    .channel(`reservations:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations', filter: `user_id=eq.${userId}` },
      () => fetchReservations(userId, callback)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToReservation(reservationId, callback) {
  if (!isSupabaseConfigured || !reservationId) {
    callback(null);
    return () => {};
  }

  const fetchReservation = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .maybeSingle();
    if (error) {
      console.warn('subscribeToReservation error:', error.message);
      callback(null);
      return;
    }
    callback(data ? mapReservation(data) : null);
  };

  fetchReservation();
  const channel = supabase
    .channel(`reservation:${reservationId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations', filter: `id=eq.${reservationId}` },
      fetchReservation
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getRelatedItem(reservation) {
  if (!isSupabaseConfigured || !reservation?.refId) return null;
  const tableName = reservation.type === 'seat' ? 'seats' : 'books';
  const { data, error } = await supabase.from(tableName).select('*').eq('id', reservation.refId).maybeSingle();
  if (error) {
    console.warn('getRelatedItem error:', error.message);
    return null;
  }
  return data ? { id: data.id, ...data } : null;
}

export async function markAsCollected(reservationId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('reservations').update({ status: 'collected' }).eq('id', reservationId);
}

export async function cancelReservation(reservationId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', reservationId);
}

export async function markNotificationRead(notificationId) {
  if (!isSupabaseConfigured) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
}
