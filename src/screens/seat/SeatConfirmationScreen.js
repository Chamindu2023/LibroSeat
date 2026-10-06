// Screen: Seat Confirmation | Owned by: Higgoda (Seat Module) | FR3
// TODO: show success state with the booked seat's details.
import React from 'react';
import { View } from 'react-native';
import { spacing } from '../../theme/theme';
import { PrimaryButton } from '../../components/UIKit';
import StubScreen from '../../components/StubScreen';

export default function SeatConfirmationScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <StubScreen
        title="Seat Confirmation"
        owner="Higgoda"
        todo="show seat booking success details here."
      />
      <View style={{ padding: spacing.lg }}>
        <PrimaryButton title="Back to Home" onPress={() => navigation.popToTop()} />
      </View>
    </View>
  );
}
