import * as signalR from '@microsoft/signalr'

let connection: signalR.HubConnection | null = null

export function getConnection() {
  if (connection) return connection
  connection = new signalR.HubConnectionBuilder()
    .withUrl(process.env.NEXT_PUBLIC_HUB_URL!)
    .withAutomaticReconnect()
    .build()
  return connection
}

export async function ensureStarted() {
  const c = getConnection()
  if (c.state === signalR.HubConnectionState.Disconnected) {
    await c.start()
  }
  return c
}
