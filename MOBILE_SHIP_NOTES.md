# MOBILE_SHIP_NOTES — THE CULTURE WAR Capacitor

## Done on box (local pack)

- capacitor.config.ts: appId com.fcjr89.theculturewar, appName THE CULTURE WAR, webDir .vercel/output/static
- scripts/mobile-prepare.mjs: build + copy static candidates into webDir
- scripts/mobile-verify.mjs: config, docs, scripts, deps, art, input.ts checks
- docs/MOBILE.md: iOS-first then Android, signing placeholders, landscape, safe-area
- ios/ and android/ README stubs + .gitkeep (native projects generated on Mac/Studio)
- studio/optimized/mobile art present
- package.json mobile:prepare / mobile:ios:sync / mobile:android:sync + Capacitor deps
- Did not modify src/game/input.ts

## Blockers
- Needs Mac for iOS project generation
- Needs Android Studio host for Android project generation
- Parent handles git remote; no push from this agent
## Next on Mac
1. install deps and run mobile:prepare
2. generate ios project, sync, open Xcode, Team, landscape, archive
3. generate android project, sync, Studio, minSdk 24, landscape
## Verify command
node scripts/mobile-verify.mjs
