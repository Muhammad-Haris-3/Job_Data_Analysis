FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source files
COPY analyze.py .
COPY app.py .

# Run analyze.py first to generate precomputed_data.json
# then start Flask
RUN python analyze.py

EXPOSE 7860

CMD ["python", "app.py"]