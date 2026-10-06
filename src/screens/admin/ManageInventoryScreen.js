// Screen: Manage Inventory | Owned by: Bandara (Staff/Admin Module)
// TODO: list all books (a table works well on desktop) from an adminService.js.
//  - "Add Book" -> form -> CREATE a `books` doc
//  - Edit a row -> UPDATE the `books` doc
import React from 'react';
import StubScreen from '../../components/StubScreen';

export default function ManageInventoryScreen() {
  return (
    <StubScreen
      title="Manage Inventory"
      owner="Bandara"
      todo="book inventory table + Add/Edit, wired to Firestore `books` (CREATE + UPDATE)."
    />
  );
}
