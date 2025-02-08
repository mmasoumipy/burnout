# Use official Python image
FROM python:3.10

# Set the working directory inside the container
WORKDIR /server

# Copy requirements first to cache dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the full application
COPY . .

# Expose port 8000
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "mbi_test_service:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
