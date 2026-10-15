# Autopark# Seron Fleet & Resource Manager

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-blue?style=flat-square&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Un'applicazione web moderna e bilingue (Italiano / Tedesco) progettata per la gestione intelligente del parco macchine aziendale, furgoni, e-bike comunali e sale riunioni. Include la sincronizzazione con **Outlook Calendar** (Microsoft Graph API) e un **Fahrtenbuch (registro di marcia) digitale** con rilevamento chilometrico e firma digitale.

Progettato e distribuito tramite l'ecosistema **seron-app**.

---

## 🚀 Caratteristiche Principali / Key Features

- **Gestione Risorse (Fleet Management):** Auto, furgoni, e-bike e sale riunioni con tracciamento di targhe, km iniziali/attuali e scadenze critiche (*Bollo, Revisione, Tagliando*).
- **Fahrtenbuch Digitale:** Sostituzione del registro cartaceo giallo con inserimento obbligatorio di chilometri di partenza/arrivo e firma digitale.
- **Integrazione Outlook Calendar:** Sincronizzazione automatica delle prenotazioni con i calendari aziendali tramite Microsoft Graph.
- **Interfaccia Bilingue (IT / DE):** Ottimizzato per mercati multilingue (es. Alto Adige / Austria / Germania).
- **Cloud Database (Neon Postgres):** Scalabile, sicuro e performante.

---

## ⚙️ Architettura del Database (Neon)

Esegui questo script SQL sul tuo database Neon per creare le tabelle necessarie:

```sql
-- Tabella Risorse
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'car', 'van', 'ebike', 'room'
    license_plate VARCHAR(50) UNIQUE,
    initial_km INT DEFAULT 0,
    current_km INT DEFAULT 0,
    bollo_expiry DATE,
    revision_expiry DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Prenotazioni e Fahrtenbuch
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    start_km INT,
    end_km INT,
    signature_data TEXT,
    outlook_event_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
seron-fleet-app/
├── app/
│   ├── api/
│   │   ├── reservations/    # API CRUD prenotazioni & Outlook sync
│   │   └── resources/       # API gestione parco mezzi e scadenze
│   ├── [lang]/              # Routing bilingue (it / de)
│   └── layout.tsx
├── lib/
│   └── db.ts                # Connessione PostgreSQL (Neon)
└── package.json

## Funzioni amministrative

Il pannello `/de/reservations` e `/it/reservations` include la gestione delle prenotazioni, la pianificazione della manutenzione, il registro dei viaggi completati e le statistiche con esportazione CSV.

Prima di usare queste funzioni su un database esistente, eseguire una volta `db/migrations/001_admin_features.sql` nell'editor SQL di Neon. La migrazione aggiunge i campi del registro e crea la tabella degli interventi di manutenzione.

## Accesso amministratore

L'accesso con e-mail e password usa `ADMIN_EMAIL` e `ADMIN_PASSWORD` come variabili d'ambiente. Copiare `.env.example` in `.env.local`, impostare una password robusta e riavviare l'applicazione. Non commettere `.env.local` nel repository. Il login Microsoft rimane disponibile per la sincronizzazione Outlook.