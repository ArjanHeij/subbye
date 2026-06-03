import { LocalNotifications } from "@capacitor/local-notifications";

export async function requestNotificationPermission() {
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === "granted";
}

export async function sendTestUsageNotification() {
  const granted = await requestNotificationPermission();

  if (!granted) {
    throw new Error("Notificatie toestemming niet gegeven.");
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1001,
        title: "👀 Gebruik je Netflix nog?",
        body: "Je betaalt hier elke maand voor. Tijd om even te checken?",
        schedule: { at: new Date(Date.now() + 5000) },
        sound: undefined,
      },
    ],
  });
}