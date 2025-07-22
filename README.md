# Annotation Interface (React + Django + Postgres)

A small full‑stack project for annotating Hindi sentences with discourse particles.
Users sign up, an admin approves them, then they log in, pick a **Domain → Heading → Sentence**, tag tokens, and save the tagged sentence back into the same table (`core_sentence.newsentence`).

---

## Stack

* **Backend:** Django 5, Django REST Framework, SimpleJWT, PostgreSQL
* **Frontend:** React (CRA/Vite), Axios, Bootstrap 5
* **Data import:** Pandas + openpyxl via a custom `import_from_excel` management command

---


## Repo Layout (recommended)

```
project-root/
  backend/                  # Django project (annotation_project/ + core/)
    annotation_project/
    core/
    manage.py
    requirements.txt
    .env.example
    newspaper.xlsx
    stories.xlsx
    conversation.xlsx
  frontend/                 # React app (anno-client/)
    src/
    package.json
    .env.example
  README.md
```

---

## 1. Backend Setup

### 1.1 Create venv & install deps

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate
pip install -r requirements.txt
```

### 1.2 Configure environment

Copy `.env.example` to `.env` and edit:

```ini
DEBUG=True
SECRET_KEY=change-me
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=anno_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Make sure `settings.py` reads these (via `os.environ` / `dotenv`).

### 1.3 Create DB & migrate

```bash
createdb anno_db          # or use pgAdmin
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 1.4 Load data

#### Option A – From Excel (recommended)

```bash
python manage.py import_from_excel newspaper.xlsx    --domain Newspaper
python manage.py import_from_excel stories.xlsx      --domain Stories
python manage.py import_from_excel conversation.xlsx --domain Conversation
```

Discourse particles:

```bash
python manage.py load_particles   # custom command provided below
```

### 1.5 Run server

```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 2. Frontend Setup

```bash
cd ../frontend
npm install
# or yarn
```

Create `.env`:

```
REACT_APP_API_BASE=http://localhost:8000
```

Run:

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)




