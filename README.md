# Vorgangskern Website — Version 6.0 Hybrid

Individueller, statischer Webauftritt für **Vorgangskern – Elvin Ljaic, Einzelunternehmen**.

## Eigenschaften

- präzises Dark-Editorial-Design der V5 mit der lebendigen Farb- und Bewegungssprache der V4
- responsive Startseite mit interaktiver Leistungsauswahl
- scrollbasierte Prozessdarstellung
- interaktive Anforderungen für öffentliche Auftraggeber
- strukturierte Projekt- und Ausschreibungsprüfung
- lokaler, regelbasierter Projektlotse ohne externe KI-Übertragung
- Einwilligungsverwaltung ohne Analyse- oder Werbetracking
- Impressum, Datenschutz, Cookie-/Speicherhinweise, Nutzungshinweise und Barrierefreiheit
- Cloudflare Pages Function für Kontaktanfragen mit Mail-Fallback
- animiertes, ressourcenschonendes Canvas-Hintergrundsystem ohne externe Bibliotheken
- keine externen Schriftarten, Videos, Tracker oder CDNs

## Lokale Vorschau

```bash
python3 -m http.server 4173
```

Danach `http://localhost:4173` öffnen.

## Cloudflare Pages

Das Projekt kann als statische Website direkt aus dem Repository veröffentlicht werden.

- Framework-Preset: **None**
- Build command: leer oder `exit 0`
- Output directory: `.`
- Production branch: `main`

Die Dateien `_headers` und `_redirects` werden von Cloudflare Pages verarbeitet.

### Kontaktformular

Ohne konfiguriertes Backend fällt das Formular kontrolliert auf eine vorbereitete E-Mail an `info@vorgangskern.com` zurück.

Für serverseitige Übermittlung gibt es zwei Varianten:

1. `CONTACT_WEBHOOK_URL` und optional `CONTACT_WEBHOOK_SECRET`, zum Beispiel für das mitgelieferte Google-Apps-Script.
2. `RESEND_API_KEY`, `CONTACT_FROM` und `CONTACT_TO`.

Die Werte als Cloudflare Pages Secrets beziehungsweise Environment Variables hinterlegen. Zugangsdaten niemals in `assets/app.js` oder andere Client-Dateien schreiben.

Optional kann ein Cloudflare-KV-Namespace mit dem Binding `CONTACT_RATE_LIMIT` angebunden werden.

## Rechtliche Prüfung vor Livegang

Die Rechtstexte sind an die derzeit geplante technische Konfiguration angepasst, aber keine anwaltliche Einzelfallberatung. Vor Veröffentlichung sind insbesondere zu prüfen:

- endgültiger Hostingvertrag und Cloudflare-Einstellungen
- tatsächlich verwendeter Formular- und E-Mail-Dienst
- Umsatzsteuer-Identifikationsnummer, sobald erteilt
- spätere Analyse-, Datei-, Termin- oder externe KI-Dienste
- rechtliche Schlussprüfung von Impressum und Datenschutzerklärung

## Datenschutz

Die Grundversion lädt keine Analyse-, Marketing- oder externen KI-Dienste. Der Projektlotse arbeitet lokal im Browser. Die technisch erforderliche Datenschutzentscheidung wird unter `vk-consent-v2` gespeichert. Nur bei optionaler Komfort-Einwilligung wird ein nicht vertraulicher Projektentwurf lokal gespeichert.


## Version 6.0 Hybrid

Diese Fassung kombiniert die klare, professionelle Informationsarchitektur der V5 mit kontrollierten Farbakzenten und einer lebendigen Hintergrundbewegung aus der V4-Richtung. Das Canvas-System reagiert auf Zeigerbewegungen, pausiert außerhalb des sichtbaren Bereichs und berücksichtigt `prefers-reduced-motion`.
