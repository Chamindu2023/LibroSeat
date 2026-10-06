// Screen: Book Confirmation | Owned by: Shashith (Book Module) | FR3
// TODO: show success state with the reserved book's details.
import React from 'react';
import { View } from 'react-native';
import { spacing } from '../../theme/theme';
import { PrimaryButton } from '../../components/UIKit';
import StubScreen from '../../components/StubScreen';

export default function BookConfirmationScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <StubScreen
        title="Book Confirmation"
        owner="Shashith"
        todo="show reservation success details here."
      />
      <View style={{ padding: spacing.lg }}>
        <PrimaryButton title="Back to Home" onPress={() => navigation.popToTop()} />
      </View>
    </View>
  );
}
