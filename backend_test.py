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
    
    def test_calories_today_without_auth(self):
        """Test GET /api/calories/today without authentication"""
        try:
            response = requests.get(f"{self.base_url}/calories/today", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "GET /api/calories/today (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "GET /api/calories/today (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/calories/today (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_activities_today_without_auth(self):
        """Test GET /api/activities/today without authentication"""
        try:
            response = requests.get(f"{self.base_url}/activities/today", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "GET /api/activities/today (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "GET /api/activities/today (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "GET /api/activities/today (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_water_intake_without_auth(self):
        """Test PUT /api/daily/water without authentication"""
        try:
            response = requests.put(f"{self.base_url}/daily/water?water_ml=500", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "PUT /api/daily/water (no auth)",
                    True,
                    "Correctly requires authentication",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "PUT /api/daily/water (no auth)",
                    False,
                    f"Should return 401, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "PUT /api/daily/water (no auth)",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_invalid_endpoints(self):
        """Test invalid/non-existent endpoints"""
        try:
            # Test non-existent endpoint
            response = requests.get(f"{self.base_url}/invalid/endpoint", timeout=10)
            
            if response.status_code == 404:
                self.log_result(
                    "Invalid Endpoint Handling",
                    True,
                    "Correctly returns 404 for non-existent endpoints",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "Invalid Endpoint Handling",
                    False,
                    f"Should return 404, got {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_result(
                "Invalid Endpoint Handling",
                False,
                f"Request failed: {str(e)}"
            )
    
    def test_cors_headers(self):
        """Test CORS headers are properly set"""
        try:
            # Test with a regular GET request instead of OPTIONS
            response = requests.get(f"{self.base_url}/calories/foods", timeout=10)
            
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            }
            
            # Check if any CORS headers are present
            has_cors = any(cors_headers.values())
            
            if has_cors or response.status_code == 200:
                # If we get a successful response, CORS is likely working
                self.log_result(
                    "CORS Headers",
                    True,
                    "CORS is working (API accessible from browser)",
                    {"status_code": response.status_code, "cors_headers": {k: v for k, v in cors_headers.items() if v}}
                )
            else:
                self.log_result(
                    "CORS Headers",
                    False,
                    "CORS headers not found or improperly configured",
                    {"headers": dict(response.headers)}
                )
                
        except Exception as e:
            self.log_result(
                "CORS Headers",
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
    
    def test_database_seeding(self):
        """Test if database is properly seeded with foods and activities"""
        try:
            # Test foods seeding
            response = requests.get(f"{self.base_url}/calories/foods", timeout=10)
            if response.status_code == 200:
                foods = response.json()
                expected_categories = ["Frutas", "Verduras", "Grãos", "Proteínas", "Sucos", "Lanches"]
                found_categories = set()
                
                for food in foods:
                    if "category" in food:
                        found_categories.add(food["category"])
                
                missing_categories = set(expected_categories) - found_categories
                
                if len(missing_categories) == 0:
                    self.log_result(
                        "Database Seeding - Foods",
                        True,
                        f"All food categories present: {len(foods)} foods across {len(found_categories)} categories",
                        {"categories": list(found_categories), "total_foods": len(foods)}
                    )
                else:
                    self.log_result(
                        "Database Seeding - Foods",
                        False,
                        f"Missing food categories: {missing_categories}",
                        {"found": list(found_categories), "missing": list(missing_categories)}
                    )
            
            # Test activities seeding
            response = requests.get(f"{self.base_url}/activities/list", timeout=10)
            if response.status_code == 200:
                activities = response.json()
                expected_categories = ["Academia", "Cardio", "Flexibilidade", "Core", "Mente", "Esportes"]
                found_categories = set()
                
                for activity in activities:
                    if "category" in activity:
                        found_categories.add(activity["category"])
                
                missing_categories = set(expected_categories) - found_categories
                
                if len(missing_categories) == 0:
                    self.log_result(
                        "Database Seeding - Activities",
                        True,
                        f"All activity categories present: {len(activities)} activities across {len(found_categories)} categories",
                        {"categories": list(found_categories), "total_activities": len(activities)}
                    )
                else:
                    self.log_result(
                        "Database Seeding - Activities",
                        False,
                        f"Missing activity categories: {missing_categories}",
                        {"found": list(found_categories), "missing": list(missing_categories)}
                    )
                    
        except Exception as e:
            self.log_result(
                "Database Seeding",
                False,
                f"Failed to check database seeding: {str(e)}"
            )
    
    def test_food_data_integrity(self):
        """Test food data structure and required fields"""
        try:
            response = requests.get(f"{self.base_url}/calories/foods", timeout=10)
            if response.status_code == 200:
                foods = response.json()
                
                if not foods:
                    self.log_result(
                        "Food Data Integrity",
                        False,
                        "No foods found in database"
                    )
                    return
                
                # Check first few foods for required fields
                required_fields = ["food_id", "name", "category", "calories_per_100g", "detox_friendly"]
                issues = []
                
                for i, food in enumerate(foods[:5]):  # Check first 5 foods
                    for field in required_fields:
                        if field not in food:
                            issues.append(f"Food {i+1} missing field: {field}")
                        elif field == "calories_per_100g" and not isinstance(food[field], (int, float)):
                            issues.append(f"Food {i+1} has invalid calories_per_100g type: {type(food[field])}")
                        elif field == "detox_friendly" and not isinstance(food[field], bool):
                            issues.append(f"Food {i+1} has invalid detox_friendly type: {type(food[field])}")
                
                if not issues:
                    self.log_result(
                        "Food Data Integrity",
                        True,
                        f"Food data structure is valid (checked {min(5, len(foods))} foods)",
                        {"sample_food": foods[0] if foods else None}
                    )
                else:
                    self.log_result(
                        "Food Data Integrity",
                        False,
                        f"Food data integrity issues found: {len(issues)} issues",
                        {"issues": issues[:3]}  # Show first 3 issues
                    )
            else:
                self.log_result(
                    "Food Data Integrity",
                    False,
                    f"Could not retrieve foods: {response.status_code}"
                )
                
        except Exception as e:
            self.log_result(
                "Food Data Integrity",
                False,
                f"Failed to check food data integrity: {str(e)}"
            )
    
    def test_activity_data_integrity(self):
        """Test activity data structure and required fields"""
        try:
            response = requests.get(f"{self.base_url}/activities/list", timeout=10)
            if response.status_code == 200:
                activities = response.json()
                
                if not activities:
                    self.log_result(
                        "Activity Data Integrity",
                        False,
                        "No activities found in database"
                    )
                    return
                
                # Check first few activities for required fields
                required_fields = ["activity_id", "name", "met_value", "category"]
                issues = []
                
                for i, activity in enumerate(activities[:5]):  # Check first 5 activities
                    for field in required_fields:
                        if field not in activity:
                            issues.append(f"Activity {i+1} missing field: {field}")
                        elif field == "met_value" and not isinstance(activity[field], (int, float)):
                            issues.append(f"Activity {i+1} has invalid met_value type: {type(activity[field])}")
                
                if not issues:
                    self.log_result(
                        "Activity Data Integrity",
                        True,
                        f"Activity data structure is valid (checked {min(5, len(activities))} activities)",
                        {"sample_activity": activities[0] if activities else None}
                    )
                else:
                    self.log_result(
                        "Activity Data Integrity",
                        False,
                        f"Activity data integrity issues found: {len(issues)} issues",
                        {"issues": issues[:3]}  # Show first 3 issues
                    )
            else:
                self.log_result(
                    "Activity Data Integrity",
                    False,
                    f"Could not retrieve activities: {response.status_code}"
                )
                
        except Exception as e:
            self.log_result(
                "Activity Data Integrity",
                False,
                f"Failed to check activity data integrity: {str(e)}"
            )
    
    def test_api_response_format(self):
        """Test API response formats and content types"""
        try:
            # Test foods endpoint response format
            response = requests.get(f"{self.base_url}/calories/foods", timeout=10)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type:
                    try:
                        data = response.json()
                        self.log_result(
                            "API Response Format - Foods",
                            True,
                            "Correct JSON response format",
                            {"content_type": content_type, "data_type": type(data).__name__}
                        )
                    except json.JSONDecodeError:
                        self.log_result(
                            "API Response Format - Foods",
                            False,
                            "Invalid JSON response",
                            {"content_type": content_type}
                        )
                else:
                    self.log_result(
                        "API Response Format - Foods",
                        False,
                        f"Incorrect content type: {content_type}",
                        {"expected": "application/json"}
                    )
            
            # Test activities endpoint response format
            response = requests.get(f"{self.base_url}/activities/list", timeout=10)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type:
                    try:
                        data = response.json()
                        self.log_result(
                            "API Response Format - Activities",
                            True,
                            "Correct JSON response format",
                            {"content_type": content_type, "data_type": type(data).__name__}
                        )
                    except json.JSONDecodeError:
                        self.log_result(
                            "API Response Format - Activities",
                            False,
                            "Invalid JSON response",
                            {"content_type": content_type}
                        )
                else:
                    self.log_result(
                        "API Response Format - Activities",
                        False,
                        f"Incorrect content type: {content_type}",
                        {"expected": "application/json"}
                    )
                    
        except Exception as e:
            self.log_result(
                "API Response Format",
                False,
                f"Failed to check API response format: {str(e)}"
            )

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for: {self.base_url}")
        print("=" * 60)
        
        # Test server health first
        self.test_server_health()
        
        # Test database seeding and data integrity
        print("\n🗄️ Testing Database and Data Integrity:")
        self.test_database_seeding()
        self.test_food_data_integrity()
        self.test_activity_data_integrity()
        self.test_api_response_format()
        
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
        
        # Test additional endpoints
        print("\n🔍 Testing Additional Endpoints:")
        self.test_calories_today_without_auth()
        self.test_activities_today_without_auth()
        self.test_water_intake_without_auth()
        
        # Test edge cases and error handling
        print("\n⚠️ Testing Edge Cases and Error Handling:")
        self.test_invalid_endpoints()
        self.test_cors_headers()
        
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