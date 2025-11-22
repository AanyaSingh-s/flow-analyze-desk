# desktop/api/client.py

import requests
from typing import Optional, Dict, Any
import os

class APIClient:
    def __init__(self, base_url="http://127.0.0.1:8000/api"):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.token = None

    def _auth_headers(self):
        """Attach token to all authenticated requests."""
        if not self.token:
            return {}
        return {"Authorization": f"Token {self.token}"}

    # -------------------------
    # AUTH
    # -------------------------
    def register(self, username: str, email: str, password: str) -> Dict[str, Any]:
        """Register a new user"""
        url = f"{self.base_url}/auth/register/"
        payload = {
            "username": username,
            "email": email,
            "password": password,
            "password2": password
        }

        try:
            response = self.session.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()

            self.token = data.get("token")
            if self.token:
                self.session.headers.update(self._auth_headers())

            return data
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server. Please ensure the server is running at http://127.0.0.1:8000")
        except requests.exceptions.Timeout:
            raise Exception("Connection timeout. Please check your network connection.")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 400:
                error_data = e.response.json()
                error_msg = "; ".join([f"{k}: {', '.join(v) if isinstance(v, list) else v}" 
                                      for k, v in error_data.items()])
                raise Exception(f"Registration failed: {error_msg}")
            raise Exception(f"HTTP Error: {e.response.status_code}")

    def login(self, username: str, password: str) -> Dict[str, Any]:
        """Login user"""
        url = f"{self.base_url}/auth/login/"
        payload = {
            "username": username,
            "password": password
        }

        try:
            response = self.session.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()

            self.token = data.get("token")
            if self.token:
                self.session.headers.update(self._auth_headers())

            return data
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server. Please ensure the server is running at http://127.0.0.1:8000")
        except requests.exceptions.Timeout:
            raise Exception("Connection timeout. Please check your network connection.")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 400 or e.response.status_code == 401:
                raise Exception("Invalid username or password")
            raise Exception(f"HTTP Error: {e.response.status_code}")

    def logout(self) -> Dict[str, Any]:
        """Logout user"""
        url = f"{self.base_url}/auth/logout/"
        
        try:
            response = self.session.post(url, headers=self._auth_headers(), timeout=10)
            response.raise_for_status()
            
            self.token = None
            self.session.headers.pop("Authorization", None)
            
            return response.json()
        except Exception:
            self.token = None
            self.session.headers.pop("Authorization", None)
            return {"message": "Logged out locally"}

    def profile(self) -> Dict[str, Any]:
        """Get user profile"""
        url = f"{self.base_url}/auth/profile/"
        try:
            response = self.session.get(url, headers=self._auth_headers(), timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise Exception("Authentication required")
            raise Exception(f"HTTP Error: {e.response.status_code}")

    # -------------------------
    # DATASETS
    # -------------------------
    def upload_csv(self, file_path: str) -> Dict[str, Any]:
        """Upload CSV file using the /upload/ endpoint"""
        # Use the correct upload endpoint!
        url = f"{self.base_url}/datasets/upload/"
        
        # Get just the filename without path
        filename = os.path.basename(file_path)

        try:
            # Read file in binary mode
            with open(file_path, "rb") as f:
                # Prepare multipart form data - only 'file' field needed for upload endpoint
                files = {
                    "file": (filename, f, "text/csv")
                }
                
                # Create headers without Content-Type (let requests set it for multipart)
                headers = {}
                if self.token:
                    headers["Authorization"] = f"Token {self.token}"
                
                response = self.session.post(
                    url, 
                    files=files,
                    headers=headers,
                    timeout=60
                )
            
            # Check for errors
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    if isinstance(error_data, dict):
                        error_msgs = []
                        for key, value in error_data.items():
                            if isinstance(value, list):
                                error_msgs.append(f"{key}: {', '.join(str(v) for v in value)}")
                            else:
                                error_msgs.append(f"{key}: {value}")
                        raise Exception(f"Upload validation error: {'; '.join(error_msgs)}")
                    else:
                        raise Exception(f"Upload failed: {error_data}")
                except ValueError:
                    raise Exception(f"Upload failed with status 400: {response.text}")
            
            # Handle 500 server errors with more detail
            if response.status_code == 500:
                try:
                    error_detail = response.text[:500]  # Get first 500 chars of error
                    raise Exception(f"Server error (500): {error_detail}")
                except:
                    raise Exception("Server error (500): Internal server error. Check Django logs.")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server")
        except requests.exceptions.Timeout:
            raise Exception("Upload timeout. File may be too large.")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise Exception("Authentication required. Please login.")
            elif e.response.status_code == 413:
                raise Exception("File too large for server")
            try:
                error_detail = e.response.json()
                raise Exception(f"Upload failed: {error_detail}")
            except:
                raise Exception(f"Upload failed: {e.response.status_code}")
        except FileNotFoundError:
            raise Exception(f"File not found: {file_path}")
        except Exception as e:
            if "Upload" in str(e) or "validation" in str(e):
                raise
            raise Exception(f"Upload error: {str(e)}")

    def get_history(self) -> Dict[str, Any]:
        """Get upload history"""
        url = f"{self.base_url}/datasets/"
        try:
            response = self.session.get(url, headers=self._auth_headers(), timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise Exception("Authentication required")
            raise Exception(f"HTTP Error: {e.response.status_code}")

    def get_dataset_data(self, dataset_id: int) -> Dict[str, Any]:
        """Get dataset data by ID"""
        url = f"{self.base_url}/datasets/{dataset_id}/"
        try:
            response = self.session.get(url, headers=self._auth_headers(), timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise Exception("Authentication required")
            elif e.response.status_code == 404:
                raise Exception("Dataset not found")
            raise Exception(f"HTTP Error: {e.response.status_code}")

    # -------------------------
    # REPORTS
    # -------------------------
    def generate_report(self, dataset_id: int) -> Dict[str, Any]:
        """Generate PDF report for dataset"""
        url = f"{self.base_url}/reports/"
        payload = {"dataset_id": dataset_id}
        
        try:
            response = self.session.post(
                url, 
                json=payload, 
                headers=self._auth_headers(),
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server")
        except requests.exceptions.Timeout:
            raise Exception("Report generation timeout")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise Exception("Authentication required")
            elif e.response.status_code == 404:
                raise Exception("Dataset not found")
            raise Exception(f"Report generation failed: {e.response.status_code}")

    def get_reports(self) -> Dict[str, Any]:
        """Get all reports"""
        url = f"{self.base_url}/reports/"
        try:
            response = self.session.get(url, headers=self._auth_headers(), timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to backend server")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise Exception("Authentication required")
            raise Exception(f"HTTP Error: {e.response.status_code}")
