import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.subbye.mobile",
  appName: "SubBye",
  webDir: "public",
  server: {
    url: "https://subbye-9j2w.vercel.app",
    cleartext: true,
  },
};

export default config;