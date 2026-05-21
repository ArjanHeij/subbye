"use client";

import { useEffect } from "react";
import { Purchases } from "@revenuecat/purchases-capacitor";

export default function RevenueCatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        await Purchases.configure({
          apiKey: "goog_EFJyCiCjXrfVHKyKLXMyzlJZdgQ",
        });

        console.log("RevenueCat initialized");
      } catch (error) {
        console.error("RevenueCat init error:", error);
      }
    };

    setupRevenueCat();
  }, []);

  return <>{children}</>;
}