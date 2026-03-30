import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.subbye.mobile",
  appName: "SubBye",
  webDir: "public",
  server: {
    url: "https://subbye-9j2w.vercel.app",
    cleartext: false,
  },
  plugins: {
    StatusBar: {
      style: "default",
      overlaysWebView: false,
      backgroundColor: "#ffffff",
    },
    SystemBars: {
      insetsHandling: "css",
      style: "DEFAULT",
      hidden: false,
    },
  },
};

export default config;