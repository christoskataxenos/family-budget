[English](#english) | [Ελληνικά](#ελληνικά)

---

<a name="english"></a>
# Family Budget & Finance Tracker

Family Budget is a self-hosted web application for tracking household income, expenses, investments, and savings. It uses FastAPI and React, runs on SQLite or Docker, and maintains a low RAM and CPU footprint.

## Core Features

- **Transaction Management**: Record income, expenses, investments, and savings with dates, amounts, frequencies, and user attribution.
- **Categorization**: 12 predefined expense categories (Housing, Utilities, Loans & Installments, Insurance, Groceries, Transport, Health, Education, Taxes & Fees, Personal Care & Shopping, Entertainment, and Other).
- **Budget Limits**: Define monthly spending thresholds per category. The system tracks consumption against limits and flags overspending.
- **Role-Based Access**: Multi-user support with Administrator (protected by a 4-digit PIN) and Member roles.
- **Data Export**: Export stored records to CSV, XLSX, and JSON files directly from the web interface.
- **Visual Analytics**: Interactive category distribution and spending overview charts powered by Recharts.

## Architecture & Tech Stack

- **Backend**: Python 3.14+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, SQLite.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Deployment**: Docker, Docker Compose, Caddy.

## Quick Start

### Local Development (Windows 11)

#### Backend Setup (Port 8050)

Run the setup and execution scripts from PowerShell in the `backend` directory:

```powershell
cd backend
.\setup_win11.ps1
.\run_win11.ps1
```

- API Documentation: http://localhost:8050/docs
- Health Status: http://localhost:8050/health

#### Frontend Setup (Port 3000)

Run the startup script in a second PowerShell window within the `frontend` directory:

```powershell
cd frontend
.\run_frontend_win11.ps1
```

- Web Interface: http://localhost:3000

### Docker Deployment

To launch the full stack (Backend, Frontend, and Caddy Reverse Proxy) with a single command:

```bash
cp .env.example .env
docker-compose up --build -d
```

- Caddy Proxy: http://localhost:8080
- API Documentation: http://localhost:8050/docs

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Christos Kataxenos.

---

<a name="ελληνικά"></a>
# Διαχείριση Οικογενειακού Προϋπολογισμού

Το Family Budget είναι μια αυτο-φιλοξενούμενη (self-hosted) εφαρμογή ιστού για την παρακολούθηση εσόδων, εξόδων, επενδύσεων και αποταμιεύσεων μιας οικογένειας. Βασίζεται σε FastAPI και React, χρησιμοποιεί SQLite ή Docker, και είναι σχεδιασμένο για χαμηλή κατανάλωση πόρων RAM και CPU.

## Βασικές Λειτουργίες

- **Διαχείριση Συναλλαγών**: Καταγραφή εσόδων, εξόδων, επενδύσεων και αποταμιεύσεων με ημερομηνία, ποσό, συχνότητα και αντιστοίχιση σε μέλος της οικογένειας.
- **Κατηγοριοποίηση Εξόδων**: 12 προκαθορισμένες κατηγορίες εξόδων (Σπίτι, Κοινή Ωφέλεια, Δάνεια & Δόσεις, Ασφάλειες, Σούπερ Μάρκετ, Μεταφορές, Υγεία, Εκπαίδευση, Φόροι & Τέλη, Προσωπική Φροντίδα & Αγορές, Ψυχαγωγία, Άλλα Έξοδα).
- **Όρια Προϋπολογισμού**: Ορισμός μηνιαίων ορίων δαπάνης ανά κατηγορία με οπτική επισήμανση υπερβάσεων.
- **Ρόλοι Χρηστών**: Διαχωρισμός δικαιωμάτων σε Διαχειριστή (Admin με προστασία 4-ψηφιου PIN) και απλά Μέλη Οικογένειας.
- **Εξαγωγή Δεδομένων**: Εξαγωγή εγγραφών σε αρχεία CSV, XLSX (Excel) και JSON απευθείας από τη διεπαφή.
- **Γραφήματα & Αναλύσεις**: Οπτικοποίηση κατανομής δαπανών με διαδραστικά γραφήματα μέσω Recharts.

## Αρχιτεκτονική & Τεχνολογίες

- **Backend**: Python 3.14+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, SQLite.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Deployment**: Docker, Docker Compose, Caddy.

## Οδηγός Εκτέλεσης

### Τοπική Ανάπτυξη (Windows 11)

#### Εκκίνηση Backend (Port 8050)

Εκτελέστε τα παρακάτω PowerShell scripts στον φάκελο `backend`:

```powershell
cd backend
.\setup_win11.ps1
.\run_win11.ps1
```

- Τεκμηρίωση API: http://localhost:8050/docs
- Έλεγχος Κατάστασης: http://localhost:8050/health

#### Εκκίνηση Frontend (Port 3000)

Εκτελέστε το script σε δεύτερο παράθυρο PowerShell στον φάκελο `frontend`:

```powershell
cd frontend
.\run_frontend_win11.ps1
```

- Διεπαφή Χρήστη: http://localhost:3000

### Εκτέλεση μέσω Docker

Για την εκκίνηση της πλήρους εφαρμογής (Backend, Frontend και Caddy Reverse Proxy) σε περιβάλλον Docker:

```bash
cp .env.example .env
docker-compose up --build -d
```

- Caddy Proxy: http://localhost:8080
- Τεκμηρίωση API: http://localhost:8050/docs

## Άδεια Χρήσης

Το παρόν έργο διατίθεται υπό την άδεια χρήσης MIT License. Δείτε το αρχείο [LICENSE](LICENSE) για λεπτομέρειες.

Copyright (c) 2026 Christos Kataxenos.
