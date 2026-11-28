/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> }

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = (() => {
    try { return event.data?.json() ?? {} } catch { return { body: event.data?.text() } }
  })() as { title?: string; body?: string; url?: string }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Tagebuch', {
      body: data.body ?? '',
      icon: 'pwa-192x192.png',
      tag: 'tagebuch-reminder',
      data: { url: data.url ?? self.registration.scope },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string = event.notification.data?.url ?? self.registration.scope
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const w of windows) {
        if (w.url.startsWith(self.registration.scope)) {
          await w.focus()
          return w.navigate(url)
        }
      }
      return self.clients.openWindow(url)
    })(),
  )
})
