import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

let listenersRegistered = false;

export async function registerForPushNotifications() {
  if (Capacitor.getPlatform() === "web") {
    return;
  }

  let permission = await PushNotifications.checkPermissions();

  if (permission.receive !== "granted") {
    permission = await PushNotifications.requestPermissions();
  }

  if (permission.receive !== "granted") {
    return;
  }

  if (!listenersRegistered) {
    PushNotifications.addListener("registration", async (token) => {
      const { supabase } = await import("@/lib/supabaseClient");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      await supabase.from("push_tokens").upsert(
        {
          user_id: user.id,
          token: token.value,
        },
        {
          onConflict: "user_id,token",
        }
      );
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push received:", notification);
    });

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log("Push opened:", notification);
      }
    );

    listenersRegistered = true;
  }

  await PushNotifications.register();
}