import { LocalNotifications } from "@capacitor/local-notifications";

const DAY = 24 * 60 * 60 * 1000;

export async function requestNotificationPermission() {
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === "granted";
}

export async function scheduleSubByeCheckInNotifications() {
  const granted = await requestNotificationPermission();

  if (!granted) {
    throw new Error("Notificatie toestemming niet gegeven.");
  }

  await LocalNotifications.cancel({
    notifications: [
      { id: 3001 },
      { id: 3002 },
      { id: 3003 },
      { id: 3004 },
      { id: 3005 },
    ],
  });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 3001,
        title: "👀 Gebruik je al je abonnementen nog?",
        body: "Open SubBye en doe een snelle check.",
        schedule: { at: new Date(Date.now() + 3 * DAY) },
      },
      {
        id: 3002,
        title: "🤔 Welk abonnement mis je het minst?",
        body: "Misschien zit daar je eerste besparing.",
        schedule: { at: new Date(Date.now() + 7 * DAY) },
      },
      {
        id: 3003,
        title: "💸 Nog steeds alles waard?",
        body: "Check even waar je maandelijks voor betaalt.",
        schedule: { at: new Date(Date.now() + 14 * DAY) },
      },
      {
        id: 3004,
        title: "📊 Tijd voor een SubBye check",
        body: "Een snelle blik kan je geld besparen.",
        schedule: { at: new Date(Date.now() + 21 * DAY) },
      },
      {
        id: 3005,
        title: "😅 Zit er iets tussen dat je vergeten bent?",
        body: "Open SubBye en loop je abonnementen kort na.",
        schedule: { at: new Date(Date.now() + 30 * DAY) },
      },
    ],
  });
}