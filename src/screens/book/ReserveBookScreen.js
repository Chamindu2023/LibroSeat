// Screen: Reserve Book | Owned by: Shashith (Book Module) | FR5
// TODO: "Confirm" button -> create a `reservations` doc (CREATE) + update the
// book's isAvailable field (UPDATE), then navigate to BookConfirmation.
import React from 'react';
import StubScreen from '../../components/StubScreen';

export default function ReserveBookScreen() {
  return (
    <StubScreen
      title="Reserve Book"
      owner="Shashith"
      todo="confirm reservation — create a reservation doc, update book availability."
    />
  );
}
