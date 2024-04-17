const PUBLIC_VAPID_KEY =
  "BF8YBHw5XqFca0FzoRAChoGCspvx53MsmHLzXg6oNnhjhfqctWeQC18JxvenI5mIX7ZGBmYW4mScVQTvvMjfcX4";

const id_user = "101010";
const path_notification = "/subscription";
const path_notification_now = "/notification_now";

function esDispositivoApple() {
  return /(Macintosh|iPhone|iPod|iPad)/i.test(navigator.userAgent);
}

const dispositivo = esDispositivoApple();

console.log(dispositivo ? "Apple" : "No Apple");

const subscription = async () => {
  const register = await navigator.serviceWorker.register("/worker.js", {
    scope: "/",
  });

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });

  await fetch(path_notification, {
    method: "POST",
    body: JSON.stringify({
      subscription,
      id_user,
      type: dispositivo ? "2" : "1",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("Subscribed!");
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Service Worker Support
if (!dispositivo) {
  if ("serviceWorker" in navigator) {
    subscription().catch((err) => console.log(err));
  }
} else {
}
