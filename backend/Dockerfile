FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run with uvicorn. app.main:app means app/main.py -> app object
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
