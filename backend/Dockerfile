FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY analyze.py .
COPY app.py .
COPY precomputed_data.json .

EXPOSE 7860

CMD ["python", "app.py"]