// Screen: Manage Reservations | Owned by: Bandara (Staff/Admin Module)
// TODO: list all reservations (READ), allow releasing an unused seat (UPDATE/DELETE).
import React from 'react';
import StubScreen from '../../components/StubScreen';

export default function ManageReservationsScreen() {
  return (
    <StubScreen
      title="Manage Reservations"
      owner="Bandara"
      todo="reservations table wired to Firestore `reservations` (READ + DELETE)."
    />
  );
}
