import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

interface OutlookEventParams {
  title: string;
  startDateTime: string;
  endDateTime: string;
  vehicle: string;
  startKm: number;
  endKm?: number;
  notes?: string;
  location?: string;
}

async function getCalendarIdByName(accessToken: string, calendarName: string): Promise<string | null> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/calendars?$top=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const calendar = data.value?.find(
    (c: any) => c.name.trim().toLowerCase() === calendarName.trim().toLowerCase()
  );

  return calendar ? calendar.id : null;
}

export async function createOutlookEvent(req: NextRequest, event: OutlookEventParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.accessToken) {
    throw new Error("Effettua prima il login Microsoft per sincronizzare il calendario.");
  }

  const accessToken = token.accessToken as string;
  let targetCalendarId = await getCalendarIdByName(accessToken, "Test Buchungen");
  if (!targetCalendarId) {
    targetCalendarId = await getCalendarIdByName(accessToken, "Buchungen");
  }

  const endpoint = targetCalendarId 
    ? `https://graph.microsoft.com/v1.0/me/calendars/${targetCalendarId}/events`
    : "https://graph.microsoft.com/v1.0/me/events";

  const descriptionContent = `
Fahrzeug: ${event.vehicle}
Start-Kilometerstand: ${event.startKm} km
${event.endKm ? `End-Kilometerstand: ${event.endKm} km` : ""}
${event.notes ? `\nWichtige Hinweise / Notizen (Strafzettl/Unfall): ${event.notes}` : ""}
  `.trim();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: event.title,
      body: {
        contentType: "Text",
        content: descriptionContent,
      },
      start: {
        dateTime: event.startDateTime,
        timeZone: "Europe/Rome",
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: "Europe/Rome",
      },
      location: {
        displayName: event.location || "Malles Venosta",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Outlook API Fehler: ${errorData.error?.message || response.statusText}`);
  }

  const createdEvent = await response.json();
  return { ...createdEvent, calendarId: targetCalendarId };
}

export async function deleteOutlookEvent(req: NextRequest, eventId: string, calendarId?: string | null) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) {
    throw new Error("Kein Microsoft-Zugriffstoken für die Outlook-Synchronisierung vorhanden.");
  }

  const endpoint = calendarId
    ? `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`
    : `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token.accessToken as string}` },
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Outlook-Termin konnte nicht gelöscht werden (${response.status}).`);
  }
}