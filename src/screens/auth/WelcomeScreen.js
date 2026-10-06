import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme/theme';

const slides = [
  { title: 'LibroSeat', tagline: 'Reserve. Read. Relax.' },
  { title: 'LibroSeat', tagline: 'Find books and seats faster.' },
  { title: 'LibroSeat', tagline: 'Manage your library day with ease.' },
];

export default function WelcomeScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();

  const handleScrollEnd = (event) => {
    const width = event.nativeEvent.layoutMeasurement.width;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
    if (nextIndex === slides.length - 1) {
      setTimeout(() => navigation.replace('RoleSelection'), 300);
    }
  };

  const handlePress = () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
      return;
    }
    navigation.replace('RoleSelection');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.scroller}
      >
        {slides.map((slide) => (
          <TouchableOpacity key={slide.tagline} activeOpacity={0.9} style={[styles.slide, { width }]} onPress={handlePress}>
            <View style={styles.iconBox}>
              <Ionicons name="library-outline" size={62} color={colors.white} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.tagline}>{slide.tagline}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {slides.map((slide, dotIndex) => (
          <View key={slide.tagline} style={[styles.dot, index === dotIndex && styles.activeDot]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  scroller: { flexGrow: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconBox: {
    width: 132,
    height: 132,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  title: { marginTop: spacing.lg, color: colors.white, fontSize: 34, fontWeight: '800' },
  tagline: { marginTop: spacing.sm, color: colors.white, fontSize: 17, fontWeight: '500' },
  dots: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' },
  activeDot: { width: 22, backgroundColor: colors.white },
});
