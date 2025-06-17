import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.essentials.app",
  appName: "Essentials",
  webDir: ".next",
  server: {
    url: "http://localhost:3000", // <-- point to your local Next.js server
    cleartext: true,
  },
};

export default config;
