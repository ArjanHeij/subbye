import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

export async function testPushNotifications() {
  alert(`Platform: ${Capacitor.getPlatform()}`);

  try {
    alert("Stap 1: permission check");

    let permission = await PushNotifications.checkPermissions();

    alert(`Huidige permission: ${permission.receive}`);

    if (permission.receive !== "granted") {
      alert("Stap 2: permission request");

      permission = await PushNotifications.requestPermissions();

      alert(`Nieuwe permission: ${permission.receive}`);
    }

    if (permission.receive !== "granted") {
      alert("Geen toestemming voor push notificaties.");
      return;
    }

    alert("Stap 3: listeners toevoegen");

    PushNotifications.addListener("registration", async (token) => {
  alert(`FCM token ontvangen: ${token.value.slice(0, 25)}...`);

  const { supabase } = await import("@/lib/supabaseClient");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Geen gebruiker gevonden om token op te slaan.");
    return;
  }

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: user.id,
      token: token.value,
    },
    {
      onConflict: "user_id,token",
    }
  );

  if (error) {
    alert(`Token opslaan mislukt: ${error.message}`);
    return;
  }

  alert("Push token opgeslagen in Supabase ✅");
});

    PushNotifications.addListener("registrationError", (error) => {
      alert(`FCM registratie error: ${JSON.stringify(error)}`);
      console.error("FCM registratie error:", error);
    });

    alert("Stap 4: register");

    await PushNotifications.register();

    alert("Registratie gestart. Wacht op FCM token...");
  } catch (err: any) {
    alert(`Push error: ${err?.message ?? JSON.stringify(err)}`);
  }
}