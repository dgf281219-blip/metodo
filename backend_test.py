#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Método Isabela Ansanello App
Tests all endpoints mentioned in the review request
"""

import requests
import json
from datetime import datetime, timezone
import uuid
import sys
import os

# Get backend URL from frontend .env
BACKEND_URL = "https://detox21dias.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session_token = None
        self.user_data = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_auth_process_session(self):
        """Test POST /api/auth/process-session"""
        try:
            # This endpoint requires a valid session_id from Google OAuth
            # For testing, we'll simulate the expected behavior
            test_data = {
                "session_id": "test_session_123"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/process-session",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 400:
                # Expected behavior for invalid session_id
                self.log_result(
                    "POST /api/auth/process-session",
                    True,
                    "Correctly rejects invalid session_id",
                    {"status_code": response.status_code, "response": response.text}
                )
            else:
                self.log_result(
                    "POST /api/auth/process-session",
                    False,
                    f"Unexpected response: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "POST /api/auth/process-session",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_auth_me_without_token(self):
        """Test GET /api/auth/me without authentication"""
        try:
            response = requests.get(f"{self.base_url}/auth/me", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "GET /api/auth/me (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "GET /api/auth/me (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/auth/me (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_user_profile_without_auth(self):
        """Test PUT /api/user/profile without authentication"""
        try:
            test_data = {
                "name": "Test User",
                "age": 30,
                "weight": 70.0,
                "height": 170.0
            }
            
            response = requests.put(
                f"{self.base_url}/user/profile",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result(
                    "PUT /api/user/profile (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "PUT /api/user/profile (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "PUT /api/user/profile (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_user_goals_without_auth(self):
        """Test POST /api/user/goals without authentication"""
        try:
            test_data = {
                "meta_principal": "Perder peso",
                "desejo_transformar": "Meu corpo",
                "sentimento_desejado": "Confiança",
                "compromisso": "Seguir o método"
            }
            
            response = requests.post(
                f"{self.base_url}/user/goals",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result(
                    "POST /api/user/goals (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "POST /api/user/goals (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "POST /api/user/goals (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_user_goals_without_auth(self):
        """Test GET /api/user/goals without authentication"""
        try:
            response = requests.get(f"{self.base_url}/user/goals", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "GET /api/user/goals (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "GET /api/user/goals (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/user/goals (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_daily_record_without_auth(self):
        """Test POST /api/daily/record without authentication"""
        try:
            test_data = {
                "date": "2024-01-15",
                "day_number": 1,
                "sentimentos": "Motivada para começar"
            }
            
            response = requests.post(
                f"{self.base_url}/daily/record",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result(
                    "POST /api/daily/record (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "POST /api/daily/record (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "POST /api/daily/record (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_daily_record_without_auth(self):
        """Test GET /api/daily/record/{date} without authentication"""
        try:
            response = requests.get(f"{self.base_url}/daily/record/2024-01-15", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "GET /api/daily/record/{date} (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "GET /api/daily/record/{date} (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/daily/record/{date} (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_foods(self):
        """Test GET /api/calories/foods (public endpoint)"""
        try:
            response = requests.get(f"{self.base_url}/calories/foods", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(
                        "GET /api/calories/foods",
                        True,
                        f"Successfully retrieved {len(data)} foods",
                        {"count": len(data), "sample": data[:2] if data else []}
                    )
                else:
                    self.log_result(
                        "GET /api/calories/foods",
                        False,
                        "Response is not a list",
                        {"response_type": type(data).__name__}
                    )
            else:
                self.log_result(
                    "GET /api/calories/foods",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/calories/foods",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_foods_with_filters(self):
        """Test GET /api/calories/foods with filters"""
        try:
            # Test category filter
            response = requests.get(
                f"{self.base_url}/calories/foods",
                params={"category": "Frutas"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "GET /api/calories/foods (category filter)",
                    True,
                    f"Successfully filtered by category: {len(data)} items",
                    {"count": len(data)}
                )
            else:
                self.log_result(
                    "GET /api/calories/foods (category filter)",
                    False,
                    f"Filter failed: {response.status_code}",
                    {"response": response.text}
                )
            
            # Test search filter
            response = requests.get(
                f"{self.base_url}/calories/foods",
                params={"search": "maçã"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "GET /api/calories/foods (search filter)",
                    True,
                    f"Successfully searched: {len(data)} items",
                    {"count": len(data)}
                )
            else:
                self.log_result(
                    "GET /api/calories/foods (search filter)",
                    False,
                    f"Search failed: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/calories/foods (filters)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_add_meal_without_auth(self):
        """Test POST /api/calories/add-meal without authentication"""
        try:
            test_data = {
                "meal_type": "cafe_manha",
                "food_id": "f001",
                "portions": 150.0
            }
            
            response = requests.post(
                f"{self.base_url}/calories/add-meal",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result(
                    "POST /api/calories/add-meal (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "POST /api/calories/add-meal (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "POST /api/calories/add-meal (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_activities(self):
        """Test GET /api/activities/list (public endpoint)"""
        try:
            response = requests.get(f"{self.base_url}/activities/list", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(
                        "GET /api/activities/list",
                        True,
                        f"Successfully retrieved {len(data)} activities",
                        {"count": len(data), "sample": data[:2] if data else []}
                    )
                else:
                    self.log_result(
                        "GET /api/activities/list",
                        False,
                        "Response is not a list",
                        {"response_type": type(data).__name__}
                    )
            else:
                self.log_result(
                    "GET /api/activities/list",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/activities/list",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_get_activities_with_filter(self):
        """Test GET /api/activities/list with category filter"""
        try:
            response = requests.get(
                f"{self.base_url}/activities/list",
                params={"category": "Cardio"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "GET /api/activities/list (category filter)",
                    True,
                    f"Successfully filtered activities: {len(data)} items",
                    {"count": len(data)}
                )
            else:
                self.log_result(
                    "GET /api/activities/list (category filter)",
                    False,
                    f"Filter failed: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/activities/list (filter)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_add_activity_without_auth(self):
        """Test POST /api/activities/add without authentication"""
        try:
            test_data = {
                "activity_id": "a002",
                "duration": 30,
                "intensity": "media"
            }
            
            response = requests.post(
                f"{self.base_url}/activities/add",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_result(
                    "POST /api/activities/add (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "POST /api/activities/add (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "POST /api/activities/add (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_method_progress_without_auth(self):
        """Test GET /api/method/progress without authentication"""
        try:
            response = requests.get(f"{self.base_url}/method/progress", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "GET /api/method/progress (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "GET /api/method/progress (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/method/progress (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_server_health(self):
        """Test if server is running and responding"""
        try:
            # Try to access the base API endpoint
            response = requests.get(f"{self.base_url.rstrip('/api')}", timeout=10)
            
            if response.status_code in [200, 404, 422]:  # Any response means server is up
                self.log_result(
                    "Server Health Check",
                    True,
                    f"Server is responding (status: {response.status_code})",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "Server Health Check",
                    False,
                    f"Server returned unexpected status: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "Server Health Check",
                False,
                f"Server is not responding: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for: {self.base_url}")
        print("=" * 60)
        
        # Test server health first
        self.test_server_health()
        
        # Test authentication endpoints
        print("\n📋 Testing Authentication Endpoints:")
        self.test_auth_process_session()
        self.test_auth_me_without_token()
        
        # Test user endpoints
        print("\n👤 Testing User Endpoints:")
        self.test_user_profile_without_auth()
        self.test_user_goals_without_auth()
        self.test_get_user_goals_without_auth()
        
        # Test daily record endpoints
        print("\n📅 Testing Daily Record Endpoints:")
        self.test_daily_record_without_auth()
        self.test_get_daily_record_without_auth()
        
        # Test food/calories endpoints
        print("\n🍎 Testing Food/Calories Endpoints:")
        self.test_get_foods()
        self.test_get_foods_with_filters()
        self.test_add_meal_without_auth()
        
        # Test activities endpoints
        print("\n🏃 Testing Activities Endpoints:")
        self.test_get_activities()
        self.test_get_activities_with_filter()
        self.test_add_activity_without_auth()
        
        # Test method endpoints
        print("\n📊 Testing Method 21 Days Endpoints:")
        self.test_method_progress_without_auth()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY:")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        return failed == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print(f"\n🎉 All tests passed! Backend is working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)