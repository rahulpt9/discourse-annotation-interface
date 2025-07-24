FROM python:3.12-slim

# system deps
RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# workdir
WORKDIR /app

# install deps first (better cache)
COPY annotation_project/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY annotation_project /app

# Wait script for db
COPY docker/wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=annotation_project.settings

# Use gunicorn in prod; runserver for dev
CMD ["/wait-for-db.sh", "python", "manage.py", "runserver", "0.0.0.0:8000"]
