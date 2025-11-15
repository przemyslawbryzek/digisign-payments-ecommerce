# digisign-payments-ecommerce

## Opis projektu
digisign-payments-ecommerce to aplikacja webowa umożliwiająca zarządzanie koszykiem zakupowym, składanie zamówień oraz realizację płatności potwierdzonych podpisem cyfrowym. Projekt został podzielony na część frontendową (React + Vite) i backendową (Flask), które wspólnie tworzą kompletny system e-commerce.

---

## Funkcjonalności

### Frontend:
- **Koszyk zakupowy**: Dodawanie, usuwanie i edycja produktów w koszyku
- **Uwierzytelnianie**: System logowania i rejestracji użytkowników
- **Zarządzanie zamówieniami**: Historia i szczegóły zamówień
- **Panel produktów**: Przeglądanie i wyszukiwanie produktów
- **Integracja płatności**: Obsługa płatności Stripe

### Backend:
- **API RESTful**: Pełna obsługa endpointów dla produktów, użytkowników, koszyka i zamówień
- **Generowanie PDF**: Automatyczne tworzenie faktur i dokumentów
- **Podpis cyfrowy**: Podpisywanie dokumentów PDF kluczem prywatnym
- **Płatności Stripe**: Integracja z systemem płatności
- **Baza danych SQLite**: Persystencja danych

---

##  Instalacja i uruchomienie

###  Wymagania

#### Standardowa instalacja:
* Python 3.10 lub nowszy
* Node.js 18+ i npm
* (opcjonalnie) Git

#### Docker (zalecane):
* Docker
* Docker Compose

---

###  Uruchomienie z Docker (Zalecane)

Najszybszy sposób na uruchomienie całej aplikacji:

1. Upewnij się, że masz zainstalowany Docker i Docker Compose

2. Sklonuj repozytorium i przejdź do katalogu projektu:
```bash
git clone https://github.com/przemyslawbryzek/digisign-payments-ecommerce.git
cd digisign-payments-ecommerce
```

3. Utwórz plik `.env` w katalogu `backend/` z wymaganymi zmiennymi środowiskowymi:
```env
# Flask
FLASK_ENV=development
SECRET_KEY=key
JWT_SECRET_KEY=jwt_key

# Stripe (tryb testowy)
STRIPE_SECRET_KEY=sk_test_abc...
STRIPE_PUBLIC_KEY=pk_test_abc...
STRIPE_WEBHOOK_SECRET=whsec_abc...

# Baza danych
DATABASE_URL=sqlite:///app.db
```

4. Uruchom aplikację:
```bash
docker-compose up -d
```

5. Aplikacja będzie dostępna pod adresami:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

6. Zatrzymanie aplikacji:
```bash
docker-compose down
```

7. Przebudowanie po zmianach w kodzie:
```bash
docker-compose up -d --build
```

---

###  Instalacja bez Dockera
Przy instalacji ręcznej należy ustawić odpowiednie porty i adresy w `app.py` i `vite.config.js`
####  Backend (Flask)

1. Przejdź do katalogu backend:

```
cd backend
```

2. Utwórz i aktywuj wirtualne środowisko:

**macOS / Linux:**

```
python3 -m venv venv
source venv/bin/activate
```

**Windows:**

```
python -m venv venv
venv\Scripts\activate
```

3. Zainstaluj zależności:

```
pip install -r requirements.txt
```

4. Uruchom serwer:

```
python app.py
```

Domyślnie backend działa na:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

---

###  Frontend (React)

1. Przejdź do katalogu frontend:

```
cd ../frontend
```

2. Zainstaluj paczki:

```
npm install
```

3. Uruchom serwer deweloperski:

```
npm run dev
```

Frontend działa na:
[http://127.0.0.1:3000](http://127.0.0.1:3000)

---

##  Struktura projektu

```
pteiok-projekt/
├── backend/
│   ├── app.py              # Główny plik aplikacji Flask
│   ├── models.py           # Modele bazy danych
│   ├── requirements.txt    # Zależności Python
│   ├── Dockerfile          # Konfiguracja Docker dla backendu
│   ├── .env               # Zmienne środowiskowe (nie w repo!)
│   ├── routes/            # Endpointy API
│   │   ├── cart.py
│   │   ├── orders.py
│   │   ├── payment.py
│   │   ├── products.py
│   │   └── users.py
│   ├── utils/             # Narzędzia pomocnicze
│   │   ├── pdf_generator.py
│   │   └── pdf_signer.py
│   ├── certs/             # Certyfikaty do podpisu cyfrowego
│   ├── instance/          # Baza danych SQLite
│   └── static/            # Pliki statyczne
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/           # Komunikacja z API
│   │   ├── components/    # Komponenty React
│   │   ├── context/       # Context API (AuthContext)
│   │   └── pages/         # Strony aplikacji
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile          # Konfiguracja Docker dla frontendu
│   └── nginx.conf          # Konfiguracja Nginx
│
├── docker-compose.yml      # Orkiestracja kontenerów
└── README.md
```

---

##  Technologie

### Backend:
- **Flask** - framework webowy
- **SQLAlchemy** - ORM do obsługi bazy danych
- **Flask-JWT-Extended** - autentykacja JWT
- **Stripe** - płatności online
- **pyHanko** - podpis cyfrowy PDF
- **ReportLab** - generowanie PDF

### Frontend:
- **React 19** - biblioteka UI
- **Vite** - bundler i dev server
- **React Router** - routing
- **Axios** - HTTP client
- **Tailwind CSS** - stylowanie
- **Lucide React** - ikony

### DevOps:
- **Docker** - konteneryzacja
- **Docker Compose** - orkiestracja kontenerów
- **Nginx** - serwer HTTP dla frontendu

---

##  Konfiguracja Stripe CLI (testowanie webhooków)

Stripe CLI jest niezbędny do testowania webhooków płatności w środowisku deweloperskim.

### Instalacja Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Konfiguracja i uruchomienie

1. **Zaloguj się do Stripe:**
```bash
stripe login
```
Otwórz link w przeglądarce i autoryzuj dostęp.

2. **Przekieruj webhooki do lokalnego serwera:**

```bash
stripe listen --forward-to localhost:5001/api/payment/webhook
```

3. **Skopiuj webhook secret:**
Po uruchomieniu `stripe listen`, zobaczysz komunikat:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

4. **Zaktualizuj plik `.env` w katalogu `backend/`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

5. **Zrestartuj backend** (jeśli używasz Docker):
```bash
docker-compose restart backend
```

### Testowanie płatności

Użyj testowych kart Stripe:
- **Sukces:** `4242 4242 4242 4242`
- **Odmowa:** `4000 0000 0000 0002`
- **Wymaga uwierzytelnienia:** `4000 0025 0000 3155`

Data wygaśnięcia: dowolna przyszła (np. 12/25)  
CVV: dowolne 3 cyfry (np. 123)

---

##  API Endpoints

### Użytkownicy (`/api`)
- **POST** `/api/register` - Rejestracja nowego użytkownika
  - Body: `{ "email": string, "password": string }`
  - Response: `{ "message": string, "user_id": int, "access_token": string }`

- **POST** `/api/login` - Logowanie użytkownika
  - Body: `{ "email": string, "password": string }`
  - Response: `{ "message": string, "access_token": string }`

- **GET** `/api/profile` - Pobierz profil użytkownika (wymaga JWT)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": string, "email": string }`

### Produkty (`/api/products`)
- **GET** `/api/products` - Pobierz listę wszystkich produktów
  - Response: `[{ "id": int, "name": string, "description": string, "price": float, "stock": int, "category": string, "images": array }]`

- **GET** `/api/products/<product_id>` - Pobierz szczegóły produktu
  - Response: `{ "id": int, "name": string, "description": string, "price": float, "stock": int, "category": string, "images": array }`

### Koszyk (`/api/cart`)
- **POST** `/api/cart` - Dodaj/zaktualizuj produkt w koszyku (JWT opcjonalny)
  - Body: `{ "product_id": int, "quantity": int }`
  - Response: `{ "message": string }`

- **GET** `/api/cart` - Pobierz zawartość koszyka (JWT opcjonalny)
  - Response: `[{ "product_id": int, "name": string, "price": float, "quantity": int, "images": array }]`

- **DELETE** `/api/cart` - Wyczyść cały koszyk (JWT opcjonalny)
  - Response: `{ "message": string }`

- **DELETE** `/api/cart/<product_id>` - Usuń produkt z koszyka (JWT opcjonalny)
  - Response: `{ "message": string }`

### Zamówienia (`/api`)
- **POST** `/api/checkout` - Utwórz zamówienie z koszyka (wymaga JWT)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": string, "order_id": int }`

- **GET** `/api/orders` - Pobierz listę zamówień użytkownika (wymaga JWT)
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ "order_id": int, "total_amount": float, "status": string, "date": datetime }]`

- **GET** `/api/orders/<order_id>` - Pobierz szczegóły zamówienia (wymaga JWT)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "id": int, "user_id": int, "total_amount": float, "status": string, "created_at": datetime, "items": array }`

- **GET** `/api/orders/<order_id>/pdf` - Pobierz podpisany PDF zamówienia (wymaga JWT)
  - Headers: `Authorization: Bearer <token>`
  - Response: Plik PDF (Content-Type: application/pdf)

### Płatności (`/api/payment`)
- **POST** `/api/payment/create-session` - Utwórz sesję płatności Stripe (wymaga JWT)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "order_id": int }`
  - Response: `{ "checkout_url": string }`

- **POST** `/api/payment/webhook` - Webhook Stripe (obsługa płatności)
  - Headers: `Stripe-Signature: <signature>`
  - Response: `{ "success": true }`

---

