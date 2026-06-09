import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export async function scheduleSubByeCheckInNotifications() {
  alert(`Platform: ${Capacitor.getPlatform()}`);

  try {
    alert("Stap 1: checkPermissions");

    const current = await LocalNotifications.checkPermissions();

    alert(`Huidige permission: ${current.display}`);

    let permission = current;

    if (current.display !== "granted") {
      alert("Stap 2: requestPermissions");

      permission = await LocalNotifications.requestPermissions();

      alert(`Nieuwe permission: ${permission.display}`);
    }

    if (permission.display !== "granted") {
      alert("Geen toestemming voor notificaties.");
      return;
    }

    alert("Stap 3: plannen");

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9001,
          title: "👀 Gebruik je al je abonnementen nog?",
          body: "Open SubBye en doe een snelle check.",
          schedule: { at: new Date(Date.now() + 10 * 1000) },
        },
      ],
    });

    alert("Notification gepland");
  } catch (err: any) {
    alert(`Notification error: ${err?.message ?? JSON.stringify(err)}`);
  }
}