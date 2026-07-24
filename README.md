# Family Budget & Finance Tracker 🏠💰

Ελαφριά, αυτο-φιλοξενούμενη (self-hosted) εφαρμογή διαχείρισης οικογενειακού προϋπολογισμού και οικονομικών, βελτιστοποιημένη για ελάχιστη κατανάλωση πόρων (RAM/CPU).

---

## ✨ Χαρακτηριστικά (Features)

* **📊 Πλήρης Διαχείριση Συναλλαγών**: Καταγραφή Εσόδων, Εξόδων, Επενδύσεων και Αποταμιεύσεων.
* **🏷️ Πλούσιες Κατηγορίες Εξόδων**:
  * 🛒 **Σούπερ Μάρκετ & Τρόφιμα** (Groceries)
  * 🏠 **Ενοίκιο & Σπίτι** (Housing & Rent)
  * 🏦 **Δάνεια & Δόσεις** (Loans & Installments)
  * 🛡️ **Ασφάλειες** (Insurance)
  * ⚡ **ΔΕΗ, Νερό, Ίντερνετ** (Utilities)
  * 🍕 **Ψυχαγωγία & Φαγητό έξω** (Entertainment & Dining)
  * 🚗 **Μεταφορές & Καύσιμα** (Transport & Fuel)
  * 🏥 **Υγεία & Φάρμακα** (Health & Medical)
  * 🎓 **Εκπαίδευση & Παιδιά** (Education & Family)
  * 🏛️ **Φόροι & Τέλη** (Taxes & Fees)
  * 🛍️ **Προσωπική Φροντίδα & Αγορές** (Personal Care & Shopping)
  * 📦 **Άλλα Έξοδα** (Other Expense)
* **🎯 Όρια Προϋπολογισμού (Budget Limits)**: Ορισμός μηνιαίων ορίων ανά κατηγορία με οπτικές ειδοποιήσεις υπέρβασης.
* **👥 Πολλαπλοί Χρήστες & Ρόλοι**: Διαχωρισμός σε Admin (με προστασία 4-ψηφιου PIN) και απλά Μέλη Οικογένειας.
* **🔒 Ασφάλεια**: Κρυπτογράφηση κωδικών & PIN (Passlib / bcrypt), JWT Tokens.
* **📤 Εξαγωγή Δεδομένων**: Εξαγωγή σε μορφή CSV, Excel (.xlsx) και JSON.
* **📈 Διαδραστικά Γραφήματα**: Οπτικοποίηση δαπανών και κατανομής με Recharts.

---

## 🛠️ Τεχνολογικό Στοίβαγμα (Tech Stack)

* **Backend**: FastAPI (Python 3.14+), SQLAlchemy 2.0 Async, Pydantic v2, SQLite / Uvicorn.
* **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Recharts, Lucide Icons.
* **DevOps**: Docker, Docker Compose, Caddy Reverse Proxy.

---

## 💻 Εκτέλεση σε Windows 11 (Τοπική Ανάπτυξη)

### 1. Εκκίνηση του Backend API (Port 8050)
Ανοίξτε ένα παράθυρο PowerShell στον φάκελο `backend`:
```powershell
cd backend
.\setup_win11.ps1
.\run_win11.ps1
```
* **Backend Swagger Docs**: [http://localhost:8050/docs](http://localhost:8050/docs)
* **Backend Health Check**: [http://localhost:8050/health](http://localhost:8050/health)

### 2. Εκκίνηση του Frontend Dashboard (Port 3000)
Ανοίξτε ένα **δεύτερο παράθυρο PowerShell** στον φάκελο `frontend`:
```powershell
cd frontend
.\run_frontend_win11.ps1
```
* **Frontend App**: [http://localhost:3000](http://localhost:3000)

---

## 🐧 Εκτέλεση σε Docker (Docker Compose με 1 Εντολή)

Για αυτόματη εκκίνηση Backend, Frontend & Caddy Proxy στο Fedora Linux ή Docker Desktop:
```bash
cp .env.example .env
docker-compose up --build -d
```
* **Caddy Reverse Proxy**: [http://localhost:8080](http://localhost:8080)
* **API Documentation**: [http://localhost:8050/docs](http://localhost:8050/docs)
