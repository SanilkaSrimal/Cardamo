# Cardamom Big Server

This is the backend server for the Cardamom project, built with FastAPI.

## Prerequisites
- Python 3.10

## Setup Instructions

1. **Create a virtual environment:**
   We recommend creating a virtual environment to manage project dependencies.
   ```powershell
   py -3.10 -m venv .venv
   ```

2. **Activate the virtual environment (optional but recommended):**
   ```powershell
   # On Windows
   .venv\Scripts\activate
   ```
   *Note: If you receive a security error about running scripts being disabled, you may need to update your PowerShell execution policy for the current user by running this command as an administrator or just for your user:*
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Install the dependencies:**
   You can install the dependencies directly using the python executable within the virtual environment:
   ```powershell
   .venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

## Running the Application

Once the dependencies are installed, you can run the FastAPI server using Uvicorn. The main entry point is `main.py`.

### Local Development
To run the server locally on your machine:
```powershell
.venv\Scripts\python.exe -m uvicorn main:app --reload
```
The server will start at `http://127.0.0.1:8000`.

### Network Access (For Mobile/Physical Devices)
To make the server accessible to other devices on your local network (like a physical phone running Expo Go):
```powershell
.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Once running, you can access the server using your machine's local IP address (e.g., `http://192.168.1.5:8000`). You can view the API documentation at `http://<your-ip>:8000/docs`.
