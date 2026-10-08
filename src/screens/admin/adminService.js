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
