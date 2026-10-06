// Reusable placeholder for screens that haven't been implemented yet.
// Delete this import/usage once you replace a screen with real content —
// it's just here so the whole app is navigable from day one.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme/theme';

export default function StubScreen({ title, owner, todo }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={typography.title}>{title}</Text>
        <Text style={[typography.muted, { marginTop: spacing.xs }]}>Owner: {owner}</Text>
        <Text style={[typography.body, { marginTop: spacing.lg, textAlign: 'center' }]}>
          TODO: {todo}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
});
