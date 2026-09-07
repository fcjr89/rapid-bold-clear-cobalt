import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.fcjr89.theculturewar",
  appName: "THE CULTURE WAR",
  webDir: ".vercel/output/static",
  server: { androidScheme: "https" },
};
export default config;
