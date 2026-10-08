import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { fetchBooks, addBook } from './adminService';
import { OutlineButton, PrimaryButton } from '../../components/UIKit';

export default function ManageInventoryScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Book Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newShelf, setNewShelf] = useState('');
  const [newTotal, setNewTotal] = useState(5);
  const [newAvailable, setNewAvailable] = useState(5);
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [successBook, setSuccessBook] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchBooks();
    setBooks(data);
    setLoading(false);
  }

  async function handleAddBook() {
    if (!newTitle.trim() || !newAuthor.trim()) return;
    setIsAdding(true);
    const book = await addBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      isbn: newIsbn.trim(),
      shelf: newShelf.trim(),
      total: newTotal,
      available: newAvailable,
      category: newCategory,
    });
    if (book) {
      setBooks([book, ...books]);
      setModalVisible(false);
      setSuccessBook(book);
      setNewTitle('');
      setNewAuthor('');
      setNewIsbn('');
      setNewShelf('');
      setNewTotal(5);
      setNewAvailable(5);
      setNewCategory('');
    }
    setIsAdding(false);
  }

  const renderBook = ({ item }) => {
    const isAvailable = item.available > 0;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons name={item.icon || 'book-outline'} size={24} color="#334155" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
            
            <View style={styles.statusRow}>
              {isAvailable ? (
                <View style={styles.statusBadgeGreen}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.statusTextGreen}>Available</Text>
                </View>
              ) : (
                <View style={styles.statusBadgeRed}>
                  <View style={styles.dotRed} />
                  <Text style={styles.statusTextRed}>Out of stock</Text>
                </View>
              )}
              <Text style={isAvailable ? styles.stockText : styles.stockTextRed}>
                {item.available} / {item.total} {isAvailable ? 'in stacks' : 'available'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{item.shelf}  •  {item.code}</Text>
          </View>
          <View style={styles.footerRight}>
            <MaterialCommunityIcons name="qrcode-scan" size={16} color="#64748B" />
            <Ionicons name="chevron-forward" size={16} color="#64748B" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.appIconBg}>
            <MaterialCommunityIcons name="archive-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.topBarTitle}>Inventory</Text>
              <View style={styles.dotPrimary} />
            </View>
            <Text style={styles.topBarSub}>Main Wing • Staff Node</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="person" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>Manage Inventory</Text>
          <Text style={styles.itemCountBadge}>{books.length} items</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.syncedText}>Stacks Synced</Text>
          <View style={styles.dotPrimary} />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search books, ISBN, author..."
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.shortcutBadge}>
              <Text style={styles.shortcutText}>⌘K</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={styles.filterTextActive}>All</Text>
            <Text style={styles.filterCountActive}>{books.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Available</Text>
            <Text style={styles.filterCount}>{books.filter(b => b.available > 0).length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Checked Out</Text>
            <Text style={styles.filterCount}>{books.filter(b => b.available === 0).length}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderBook}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ADD BOOK MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>
            
            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Add New Book</Text>
                <Text style={styles.sheetSubtitle}>Enter catalog details for immediate circulation</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Book Title <Text style={{color: colors.danger}}>*</Text></Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. To Kill a Mockingbird"
            />
            
            <Text style={styles.inputLabel}>Author <Text style={{color: colors.danger}}>*</Text></Text>
            <TextInput
              style={styles.modalInput}
              value={newAuthor}
              onChangeText={setNewAuthor}
              placeholder="e.g. Harper Lee"
            />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.inputLabel}>ISBN / Catalog ID</Text>
              <View style={styles.autoScanBadge}>
                <Text style={styles.autoScanText}>AUTO-SCAN</Text>
              </View>
            </View>
            <View style={styles.iconInputContainer}>
              <MaterialCommunityIcons name="barcode-scan" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.modalInput, styles.iconInputText, {fontFamily: 'monospace'}]}
                value={newIsbn}
                onChangeText={setNewIsbn}
                placeholder="e.g. PS3523.E32 or 978-0061120084"
              />
            </View>
            
            <Text style={styles.inputLabel}>Shelf Location</Text>
            <View style={styles.iconInputContainer}>
              <Ionicons name="location-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.modalInput, styles.iconInputText]}
                value={newShelf}
                onChangeText={setNewShelf}
                placeholder="e.g. Stacks Level 2, Shelf 64-B"
              />
            </View>
            
            <View style={{flexDirection: 'row', gap: 16, marginBottom: spacing.lg}}>
              <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Total Copies</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => setNewTotal(Math.max(1, newTotal - 1))}>
                    <Ionicons name="remove" size={16} color="#475569" />
                  </TouchableOpacity>
                  <Text style={styles.stepperText}>{newTotal}</Text>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => setNewTotal(newTotal + 1)}>
                    <Ionicons name="add" size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Available</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => setNewAvailable(Math.max(0, newAvailable - 1))}>
                    <Ionicons name="remove" size={16} color="#475569" />
                  </TouchableOpacity>
                  <Text style={styles.stepperText}>{newAvailable}</Text>
                  <TouchableOpacity style={styles.stepperBtn} onPress={() => setNewAvailable(Math.min(newTotal, newAvailable + 1))}>
                    <Ionicons name="add" size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>{newCategory || 'Select catalog classification...'}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </View>
            
            <View style={styles.alertBox}>
              <View style={styles.alertIconCircle}>
                <Ionicons name="book" size={16} color="#1D4ED8" />
              </View>
              <Text style={styles.alertText}>New accession labels will be dispatched automatically to Desktop Label Station #2 upon saving.</Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity 
                style={[styles.saveBtn, (!newTitle.trim() || !newAuthor.trim()) && {opacity: 0.5}]}
                disabled={!newTitle.trim() || !newAuthor.trim() || isAdding}
                onPress={handleAddBook}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{marginRight: 6}} />
                <Text style={styles.saveBtnText}>{isAdding ? 'Saving...' : 'Save Book'}</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={!!successBook} transparent={false} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.successTopBar}>
            <TouchableOpacity onPress={() => setSuccessBook(null)}>
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
            <Text style={styles.successTopTitle}>Item Intake Success</Text>
            <View style={{flexDirection: 'row', gap: 16, alignItems: 'center'}}>
              <Ionicons name="print-outline" size={24} color="#475569" />
              <View style={styles.profileIconSmall}>
                <Ionicons name="person" size={14} color={colors.white} />
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.xl, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <View style={styles.successCheckmark}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            
            <View style={styles.syncBadge}>
              <View style={styles.dotBlue} />
              <Text style={styles.syncBadgeText}>CATALOG SYNCHRONIZED</Text>
            </View>
            
            <Text style={styles.successTitle}>Book Saved Successfully</Text>
            <Text style={styles.successSubtitle}>The record has been indexed into the central library collection and is cleared for shelf placement.</Text>

            <View style={styles.successBookCard}>
              <View style={styles.successBookHeader}>
                <View style={styles.successThumbnail}>
                  <Ionicons name="book-outline" size={24} color="#94A3B8" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.marcText}>MARC 21 ENTRY  •  #CAT-{Math.floor(10000 + Math.random() * 90000)}</Text>
                  <Text style={styles.successBookTitle}>{successBook?.title}</Text>
                  <Text style={styles.successBookAuthor}>{successBook?.author} • 2026</Text>
                  <View style={styles.isbnBadge}>
                    <Text style={styles.isbnText}>{successBook?.code}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.successGrid}>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}><Ionicons name="location-outline" size={12}/> LOCATION</Text>
                  <Text style={styles.gridValue}>{successBook?.shelf}</Text>
                  <Text style={styles.gridSub}>East Wing Stacks</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}># CALL NUMBER</Text>
                  <Text style={styles.gridValue}>FIC-{successBook?.author?.substring(0,3).toUpperCase()}-26</Text>
                  <Text style={styles.gridSub}>Dewey: 813.54</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}><Ionicons name="file-tray-stacked-outline" size={12}/> ACCESSIONS</Text>
                  <Text style={styles.gridValue}>{successBook?.total} Copies <View style={styles.dotBlue}/></Text>
                  <Text style={styles.gridSubPrimary}>All In Stacks</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}><Ionicons name="shapes-outline" size={12}/> CATEGORY</Text>
                  <Text style={styles.gridValue}>{successBook?.category || 'Classic Fiction'}</Text>
                  <Text style={styles.gridSub}>General Circulation</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewInventoryBtn} onPress={() => setSuccessBook(null)}>
              <Ionicons name="list" size={18} color={colors.white} style={{marginRight: 8}} />
              <Text style={styles.viewInventoryText}>View in Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addAnotherBtn} onPress={() => { setSuccessBook(null); setModalVisible(true); }}>
              <Ionicons name="add-square-outline" size={18} color="#1E293B" style={{marginRight: 8}} />
              <Text style={styles.addAnotherText}>Add Another Book</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.returnBtn} onPress={() => { setSuccessBook(null); navigation.goBack(); }}>
              <Text style={styles.returnText}>Return to Circulation Desk</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E2E6E9' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D4EFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  dotPrimary: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  topBarSub: { fontSize: 11, color: '#64748B', fontWeight: '600', letterSpacing: 0.5 },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSection: { paddingHorizontal: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginRight: 12 },
  itemCountBadge: { fontSize: 12, fontWeight: '700', color: colors.primary, backgroundColor: '#D4EFEF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  syncedText: { fontSize: 11, fontWeight: '600', color: '#475569', marginRight: 6 },

  searchRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.md },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1D9E0',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1E293B' },
  shortcutBadge: { backgroundColor: '#C1CBD4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  shortcutText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1D9E0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8 },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filterTextActive: { fontSize: 13, fontWeight: '600', color: colors.white },
  filterCount: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  filterCountActive: { fontSize: 13, fontWeight: '700', color: '#A5F3FC' },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: {
    width: 48,
    height: 56,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  bookTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  bookAuthor: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  
  statusBadgeGreen: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  dotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' },
  statusTextGreen: { fontSize: 11, fontWeight: '700', color: '#059669' },
  
  statusBadgeRed: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  dotRed: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  statusTextRed: { fontSize: 11, fontWeight: '700', color: colors.danger },

  stockText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  stockTextRed: { fontSize: 12, fontWeight: '600', color: colors.danger },
  
  moreButton: { padding: 4 },
  
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '600', color: '#64748B', fontFamily: 'monospace' },
  footerRight: { flexDirection: 'row', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40 },
  sheetHandleContainer: { alignItems: 'center', marginBottom: 16 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: '#64748B' },
  closeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  modalInput: { backgroundColor: '#F1F5F9', borderRadius: radius.md, paddingHorizontal: 14, height: 48, fontSize: 15, color: '#1E293B', marginBottom: spacing.lg },
  
  autoScanBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 8 },
  autoScanText: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 0.5 },
  
  iconInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: radius.md, height: 48, marginBottom: spacing.lg, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  iconInputText: { flex: 1, height: 48, backgroundColor: 'transparent', marginBottom: 0, paddingHorizontal: 0 },
  
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: radius.md, height: 48, paddingHorizontal: 6 },
  stepperBtn: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  stepperText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#1E293B' },
  
  dropdownContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: radius.md, height: 48, paddingHorizontal: 14, marginBottom: spacing.lg },
  dropdownText: { fontSize: 15, color: '#64748B' },
  
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', borderRadius: radius.md, padding: 12, marginBottom: 24, gap: 12 },
  alertIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  alertText: { flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 18 },
  
  modalActions: { flexDirection: 'row' },
  cancelBtn: { flex: 1, height: 50, borderRadius: radius.md, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  saveBtn: { flex: 1, height: 50, borderRadius: radius.md, backgroundColor: '#1D4ED8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },

  // Success Modal Styles
  successTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white },
  successTopTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  profileIconSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' },
  
  successCheckmark: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  syncBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 16, gap: 6 },
  dotBlue: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1D4ED8' },
  syncBadgeText: { fontSize: 10, fontWeight: '700', color: '#1D4ED8', letterSpacing: 0.5 },
  
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 16, marginBottom: 24, lineHeight: 20 },
  
  successBookCard: { width: '100%', backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  successBookHeader: { flexDirection: 'row', marginBottom: 20 },
  successThumbnail: { width: 60, height: 40, borderRadius: 4, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  marcText: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 4 },
  successBookTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  successBookAuthor: { fontSize: 13, color: '#475569', marginBottom: 8 },
  isbnBadge: { alignSelf: 'flex-start', backgroundColor: '#E0E7FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  isbnText: { fontSize: 11, fontWeight: '600', color: '#3730A3', fontFamily: 'monospace' },
  
  successGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridBox: { width: '48%', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12 },
  gridLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 4 },
  gridValue: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  gridSub: { fontSize: 11, color: '#64748B' },
  gridSubPrimary: { fontSize: 11, fontWeight: '600', color: '#1D4ED8' },
  
  viewInventoryBtn: { width: '100%', height: 50, borderRadius: radius.md, backgroundColor: '#1E3A8A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  viewInventoryText: { fontSize: 16, fontWeight: '700', color: colors.white },
  addAnotherBtn: { width: '100%', height: 50, borderRadius: radius.md, backgroundColor: '#DBEAFE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  addAnotherText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  
  returnBtn: { padding: 12 },
  returnText: { fontSize: 14, color: '#64748B' },
});
