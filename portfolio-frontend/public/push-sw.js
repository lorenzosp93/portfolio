self.addEventListener("push", function (event) {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = {
        body: event.data.text(),
      };
    }
  }

  const promiseChain = self.registration.showNotification(
    data?.title ?? "New message",
    {
      icon: "/pwa-512x512.png",
      badge: "/favicon-32x32.png",
      image: data?.image,
      body: data?.body,
      data: {
        url: data?.url ?? "/",
      },
    }
  );

  event.waitUntil(promiseChain);
});

self.addEventListener("notificationclick", (event) => {
  const clickedNotification = event.notification;
  clickedNotification.close();

  const urlToOpen = new URL(event.notification.data?.url ?? "/", self.location.origin)
    .href;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});