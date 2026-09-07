# Mobile — Capacitor (iOS then Android)
Order: iOS first, then Android. Touch and safe-area already in the web app.
capacitor.config.ts appId com.fcjr89.theculturewar, webDir .vercel/output/static.
Add Capacitor packages, build web, cap add ios on macOS, sync, open Xcode.
Then cap add android, sync, open Android Studio. Min SDK 24+, landscape preferred.
