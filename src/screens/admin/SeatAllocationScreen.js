// Screen: Seat Allocation / Auto-release Settings | Owned by: Bandara (Staff/Admin Module)
// Linked: User story #4 (auto-release unused seats after a grace period)
// TODO: a settings form (grace-period minutes) saved to a `settings` Firestore doc.
import React from 'react';
import StubScreen from '../../components/StubScreen';

export default function SeatAllocationScreen() {
  return (
    <StubScreen
      title="Seat Allocation Settings"
      owner="Bandara"
      todo="auto-release grace-period setting, saved to Firestore `settings/seatRules`."
    />
  );
}
