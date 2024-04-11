const icon =
  "https://progresodigital.net/resources/images/progreso_digital.ico";

self.addEventListener("push", (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon,
  });
});
