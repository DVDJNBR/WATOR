#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import json
import os
import logging

DEPLOY_TOKEN = os.getenv("DEPLOY_TOKEN", "changeme")
PROJECT_PATH = os.getenv("PROJECT_PATH", "/opt/WATOR")
PORT = int(os.getenv("WEBHOOK_PORT", "9000"))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/deploy":
            self.send_error(404, "Not Found")
            return

        token = self.headers.get("X-Deploy-Token")
        if token != DEPLOY_TOKEN:
            logging.warning(f"Invalid token from {self.client_address[0]}")
            self.send_error(403, "Forbidden")
            return

        try:
            logging.info("Deployment triggered...")
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()

            result = subprocess.run(
                ["bash", "-c", f"cd {PROJECT_PATH} && git pull origin main && docker compose down && docker compose up -d --build"],
                capture_output=True,
                text=True,
                timeout=300
            )

            response = {
                "status": "success" if result.returncode == 0 else "error",
                "stdout": result.stdout,
                "stderr": result.stderr
            }

            logging.info(f"Deployment {'succeeded' if result.returncode == 0 else 'failed'}")
            logging.info(result.stdout)
            if result.stderr:
                logging.error(result.stderr)

            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            logging.error(f"Deployment error: {str(e)}")
            self.send_error(500, str(e))

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    logging.info(f"Webhook server listening on port {PORT}")
    server.serve_forever()
