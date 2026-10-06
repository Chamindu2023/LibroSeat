// Screen: Select & Book a Seat | Owned by: Higgoda (Seat Module) | FR2
// TODO: date/time picker + "Confirm" -> create `reservations` doc (CREATE) +
// update seat's isAvailable field (UPDATE), then navigate to SeatConfirmation.
import React from 'react';
import StubScreen from '../../components/StubScreen';

export default function SelectSeatScreen() {
  return (
    <StubScreen
      title="Book a Seat"
      owner="Higgoda"
      todo="confirm seat + time slot — create reservation doc, update seat availability."
    />
  );
}
