# Mobile — Capacitor (iOS first, then Android)

App: THE CULTURE WAR
appId: com.fcjr89.theculturewar
webDir: .vercel/output/static
Art: studio/optimized/mobile/

Ship iOS then Android. Leave src/game/input.ts alone.

## Prereqs
- Node 20+
- Capacitor core/cli/ios/android/app/status-bar/haptics
- Mac Xcode for iOS; Android Studio for Android (minSdk 24)

## Flow
- prepare web into webDir
- sync ios on Mac; open Xcode
- sync android; open Studio

## Xcode
- Signing Team placeholder; bundle com.fcjr89.theculturewar
- Prefer landscape orientations
- Safe-area CSS only; leave input.ts untouched (touch inject + gamepad)

## Android Studio
- applicationId com.fcjr89.theculturewar; minSdk 24+
- Prefer landscape; same safe-area CSS

## Scripts
mobile:prepare, mobile:sync, mobile:ios, mobile:android, mobile:ios:sync, mobile:android:sync, mobile:verify

## Soundtrack
TWILIGHT ZONE TIME (NA404ERROR) — see `docs/MUSIC.md`. Files in `public/game/music/`.
