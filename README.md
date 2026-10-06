# LibroSeat (React Native)

**IT3060 – Human Computer Interaction, Milestone 03 | Group 25**
Library Book Reservation and Reading-Room Seat Booking App.

We switched from Flutter to **React Native with Expo** specifically because
Expo doesn't require Android Studio or an emulator — you install one app
(**Expo Go**) on your own phone and scan a QR code to run the app live.
This solves the "my laptop can't run Android Studio" problem entirely.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React Native + Expo** | Runs on real phones via the Expo Go app — no emulator, no Android Studio, no Xcode needed. Also runs in a browser (`expo start --web`) for previewing the Staff/Admin desktop module. |
| Backend / Database | **Cloud Firestore** (Firebase) | No server to host. Realtime updates (e.g. live seat availability) built in. Free tier is enough for this project. |
| Authentication | **Firebase Authentication** | Email/password login, same Firebase project as the database. |
| Navigation | **React Navigation** (native stack) | The standard, well-documented way to move between screens in React Native. |

## Prerequisites (every member, 5 minutes)

1. Install [Node.js](https://nodejs.org) (LTS version).
2. Install the **Expo Go** app on your phone from the Play Store / App Store.
3. That's it — no Android Studio, no Xcode, no emulator.

## First-Time Setup

```bash
cd libroseat_app
npm install

# Expo checks that every package matches your Expo SDK version and fixes
# any mismatches automatically — run this once after npm install:
npx expo install --fix

npx expo start
```

A QR code appears in the terminal / browser tab. Open the **Expo Go** app on
your phone and scan it (Android: scan from within the app; iOS: scan with
the regular Camera app, it'll prompt to open in Expo Go). The app loads on
your phone in a few seconds. Any time you save a file, the app on your phone
reloads automatically.

> Want to preview the Staff/Admin desktop screens? Run `npx expo start --web`
> and it opens in your browser instead.

## Firebase Setup (do this once, as a group)

One person (suggested: **Nimnada**, as Prototype Lead) should:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Firestore Database** and **Authentication → Email/Password**.
3. Project settings → General → "Your apps" → Add app → **Web** (`</>`) — yes,
   Web, even though this is a mobile app; the Firebase JS SDK uses the web
   config format regardless of platform.
4. Copy the `firebaseConfig` object Firebase shows you.
5. Paste it into `src/firebase/firebaseConfig.js`, replacing the placeholder values.
6. Share the Firebase project with the other 3 members (Project settings →
   Users and permissions) so everyone sees the same data.
7. In the Firestore console, manually add a few sample documents so the app
   has something to show (see "Sample Data" below).

### Sample Data (to test against while building)

Create these collections manually in the Firestore console:

- **`books`**: a few docs with fields `title` (string), `author` (string), `isAvailable` (boolean)
- **`seats`**: a few docs with fields `seatNumber` (string), `room` (string), `isAvailable` (boolean)
- **`reservations`**: a few docs with fields `userId` (string — use `"dev-test-user"` to match the app's dev fallback), `type` (`"book"` or `"seat"`), `refId` (a book/seat doc id), `status` (`"confirmed"`, `"collected"`, `"cancelled"`, or `"expired"`), `createdAt` (timestamp), `dueDate` (timestamp, optional)
- **`notifications`**: a few docs with `userId` (`"dev-test-user"`), `message` (string), `type` (`"expiry"`, `"confirmation"`, or `"pickup"`), `relatedReservationId` (optional, a reservation doc id), `createdAt` (timestamp), `isRead` (boolean)

## Who Implements What

Each member works **only inside their own screens folder** — this avoids
merge conflicts, the same parallel approach used for the Figma split in
Milestone 02.

| Member | Folder | Screens (from Milestone 02) | Linked Requirements | Status |
|---|---|---|---|---|
| **Nimnada** | `src/screens/home_account/` | Home/Dashboard, Notifications, Notification Detail, My Reservations, Reservation Detail | NFR2, Survey Q12 | ✅ **Fully implemented** — real Firestore reads/writes, live updates, cancel-confirmation modal |
| **Shashith** (Leader) | `src/screens/book/` + `src/screens/auth/` | Search Books, Book Details, Reserve Book, Book Confirmation, **Login** | FR4, FR5, FR3 | 🔲 Stub — follow the pattern in `accountService.js` to build `bookService.js` |
| **Higgoda** | `src/screens/seat/` | Seat Availability, Select & Book Seat, Seat Confirmation | FR1, FR2, FR3 | 🔲 Stub — build `seatService.js` the same way |
| **Bandara** | `src/screens/admin/` | Staff Login, Admin Dashboard, Manage Inventory, Manage Reservations, Seat Allocation | NFR3, Problem Statement (admin), User stories #3–#5 | 🔲 Stub — build `adminService.js` the same way |

**Reference implementation**: `src/screens/home_account/accountService.js` and
its five screens are fully working — read them before starting your own
module. The pattern is: one `<module>Service.js` file per folder with plain
functions (`subscribeToX`, `createX`, `updateX`, `deleteX`) that call
Firestore directly, then screens call those functions and manage their own
`useState`/`useEffect`.

Shared files (everyone reads, nobody edits without telling the group first):
- `src/theme/theme.js` — colors, spacing (our shared "design system")
- `src/components/UIKit.js` — reusable `<PrimaryButton>`, `<Card>`, `<StatusBadge>`, etc.
- `src/navigation/AppNavigator.js` — wires all screens together
- `src/hooks/useCurrentUserId.js` — shared auth hook (currently falls back to a dev test user until Shashith wires up real login)
- `src/firebase/firebaseConfig.js` — Firebase project connection (only the config values change)

## Git Workflow

1. One person creates the GitHub repo and pushes this folder as the first commit.
2. Everyone else: `git clone <repo-url>` (or, if you're not comfortable with
   Git yet, download the ZIP from GitHub — **Code → Download ZIP** — do your
   work, then re-upload your changed files through GitHub's web UI).
3. Each member works on their own screens folder + their own `<module>Service.js`.
   Commit and push often, e.g. `git commit -m "Implement book search and reserve (Shashith)"`.
4. Since folders don't overlap, conflicts should be rare.
5. Pull before you start each session: `git pull`.

## Before Submitting (checklist from Assignment 3)

- [ ] App is a working app (installable via Expo/EAS build, or demoed live through Expo Go) — not just a clickable prototype.
- [ ] Each member's interfaces have at least 2 working CRUD operations (Nimnada's module already has 4: 2 reads + 2 updates).
- [ ] Any difference between this app and the Milestone 02 high-fidelity prototype is written up and justified in the report (the Cancel Confirmation modal pattern in `ReservationDetailScreen.js` is one example already noted in that file).
- [ ] Functional test cases cover all core features, with a traceability matrix (requirements → prototype → implementation → test cases).
- [ ] Usability testing conducted on the **working app** with 5+ participants (reuse and adapt the Milestone 02 testing guide/tasks).
- [ ] Source code pushed to GitHub with this README kept up to date.
- [ ] For the "installable build" deliverable: run `npx eas build -p android --profile preview` (requires a free Expo account) to produce an installable APK, or demo directly through Expo Go during the viva — check with your coordinator which is expected.
