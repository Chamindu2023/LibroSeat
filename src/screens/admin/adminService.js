import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../../supabase/supabaseConfig';

const LOCAL_BOOKS_KEY = 'libroseat.local.books.v2';



export async function fetchBooks() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Error fetching books:', error);
      return [];
    }
    // Map supabase data to our app's structure (adding some mock fields since the schema is basic)
    return data.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      status: b.status,
      total: 3,
      available: b.status === 'available' ? 3 : 0,
      shelf: 'Shelf ??',
      code: 'Unknown',
      icon: 'book-outline',
      ...b
    }));
  }

  // Local fallback
  const raw = await AsyncStorage.getItem(LOCAL_BOOKS_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

export async function addBook(bookData) {
  const { title, author, isbn, shelf, total, available, category } = bookData;
  const newBook = {
    title,
    author: author || 'Unknown Author',
    status: available > 0 ? 'available' : 'out_of_stock',
    total: total || 1,
    available: available || 1,
    shelf: shelf || 'Shelf 00-A',
    code: isbn || 'NEW.BOOK',
    icon: 'book-outline',
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('books').insert([
      { title, author: newBook.author, status: newBook.status }
    ]).select().single();
    
    if (error) {
      console.warn('Error adding book:', error);
      return null;
    }
    return { ...newBook, ...data };
  }

  // Local fallback
  const raw = await AsyncStorage.getItem(LOCAL_BOOKS_KEY);
  const books = raw ? JSON.parse(raw) : [];
  
  const finalBook = { ...newBook, id: Date.now().toString(), created_at: new Date().toISOString() };
  const updatedBooks = [finalBook, ...books];
  
  await AsyncStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(updatedBooks));
  return finalBook;
}

export async function fetchAllReservations() {
  if (isSupabaseConfigured) {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        profiles (
          full_name,
          student_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching reservations:', error);
      return [];
    }

    // Since ref_id isn't explicitly a foreign key to books/seats in the schema, we must fetch items separately or join them if we had views.
    // To make it efficient, we fetch all books and seats, then map them.
    const [{ data: books }, { data: seats }] = await Promise.all([
      supabase.from('books').select('id, title'),
      supabase.from('seats').select('id, label'),
    ]);

    const bookMap = {};
    if (books) books.forEach(b => { bookMap[b.id] = b.title; });
    const seatMap = {};
    if (seats) seats.forEach(s => { seatMap[s.id] = s.label; });

    return reservations.map(r => ({
      id: r.id,
      userId: r.user_id,
      patronName: r.profiles?.full_name || 'Unknown User',
      patronId: r.profiles?.student_id || 'Unknown ID',
      type: r.type,
      itemName: r.type === 'book' ? (bookMap[r.ref_id] || 'Unknown Book') : (seatMap[r.ref_id] || 'Unknown Seat'),
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  // Local fallback mock data
  return [
    {
      id: '1',
      patronName: 'Marcus Chen',
      patronId: 'STU-9043',
      type: 'seat',
      itemName: 'Reading Carrel 12 (Quiet Zone)',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      patronName: 'Sophia Patel',
      patronId: 'FAC-4102',
      type: 'book',
      itemName: 'Principles of Quantum Mechanics',
      status: 'expired',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
}

export async function cancelReservation(reservationId) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);
    
    if (error) {
      console.warn('Error cancelling reservation:', error);
      return false;
    }
    return true;
  }
  return true; // Local mock fallback
}

export async function fetchSeatsData() {
  if (isSupabaseConfigured) {
    const { data: seats, error } = await supabase.from('seats').select('*').order('label', { ascending: true });
    
    if (error) {
      console.warn('Error fetching seats:', error);
      return [];
    }
    
    // Attempt to join active reservations to get patron details for occupied/unattended seats
    const { data: activeReservations } = await supabase
      .from('reservations')
      .select('ref_id, profiles(full_name, student_id)')
      .eq('type', 'seat')
      .in('status', ['confirmed', 'unattended']);
      
    const resMap = {};
    if (activeReservations) {
      activeReservations.forEach(r => {
        resMap[r.ref_id] = {
          patronName: r.profiles?.full_name || 'Unknown User',
          patronId: r.profiles?.student_id || 'Unknown ID'
        };
      });
    }

    return seats.map(s => ({
      ...s,
      patronName: resMap[s.id]?.patronName || null,
      patronId: resMap[s.id]?.patronId || null,
      idleMinutes: s.status === 'unattended' ? Math.floor(Math.random() * 45) + 5 : 0
    }));
  }

  // Local Mock Fallback matching the grid
  return [
    { id: '1', label: 'A1', status: 'free' },
    { id: '2', label: 'A2', status: 'occupied' },
    { id: '3', label: 'A3', status: 'occupied' },
    { id: '4', label: 'A4', status: 'reserved' },
    { id: '5', label: 'B1', status: 'free' },
    { id: '6', label: 'B2', status: 'occupied' },
    { id: '7', label: 'B3', status: 'unattended', idleMinutes: 34, patronName: 'M. Chen', patronId: 'STU-9043' },
    { id: '8', label: 'B4', status: 'free' },
    { id: '9', label: 'C1', status: 'occupied' },
    { id: '10', label: 'C2', status: 'unattended', idleMinutes: 12 },
    { id: '11', label: 'C3', status: 'free' },
    { id: '12', label: 'C4', status: 'reserved' },
    { id: '13', label: 'D1', status: 'occupied' },
    { id: '14', label: 'D2', status: 'occupied' },
    { id: '15', label: 'D3', status: 'free' },
    { id: '16', label: 'D4', status: 'free' },
  ];
}

export async function releaseSeat(seatId) {
  if (isSupabaseConfigured) {
    const { error: seatErr } = await supabase.from('seats').update({ status: 'free' }).eq('id', seatId);
    // Also cancel any reservation attached to this seat
    await supabase.from('reservations').update({ status: 'cancelled' }).eq('ref_id', seatId).eq('status', 'unattended');
    return !seatErr;
  }
  return true;
}
