import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.essentials.app",
  appName: "Essentials",
  webDir: "../web/out",
  server: {
    url: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000", // Development or production URL
    cleartext: true,
  },
};

export default config;
