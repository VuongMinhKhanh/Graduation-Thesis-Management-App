# Graduation Thesis Management System

This project is a Graduation Thesis Management System built using Django (backend) and React Native (frontend). The system allows management of users, theses, review boards, and grading, with role-based access control.

## Features

- User role management (Admin, Faculty, Student)
- Thesis creation and management
- Review board setup and grading
- Notification via email
- Statistics and reports
- Real-time chat using Firebase

## Prerequisites

- Python 3.x - Django
- MySQL Workbench
- Firebase account

## ERD for Database (only self-configured classes)
![image](https://github.com/user-attachments/assets/828c1a1f-77e4-498a-a32b-36b2215ba21b)

## Setup

### Backend (Django) - Used for local testing (as I deployed the backend to pythonanywhere)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/VuongMinhKhanh/Graduation-Thesis-Management-App
   ```

2. **Create a virtual environment and activate it**:
    ```bash
    python -m venv env
    source env/bin/activate  # On Windows use `env\Scripts\activate`
    ```

3. **Install dependencies**:
   ```bash
    pip install -r requirements.txt
    ```

4. **Database Configuration**:
- Ensure MySQL Woprkbench is installed and running on your machine.
- Create a database for the project based on DATABASE dictionary in settings.py file.

5. **Run migrations**:
   ```bash
   python manage.py migrate
   ```
6. **Create a superuser**:
   ```bash
   python manage.py createsuperuser
   ```
7. **Start the development server**:
   ```bash
   python manage.py runserver <your-current-IP>:8000
   ```

### Frontend (React Native)
1. **Navigate to the frontend directory**:
   ```bash
   cd ../GraduateThesisMobileApp
   ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start the React Native app**:
   If you use local backend, please adjust the BASE_URL to your current IP. 
    ```bash
    npm start
    ```
    And chose suitable platform for the frontend.

### Firebase Setup
- Configure Firebase for real-time chat functionality.
- Obtain your Firebase configuration and integrate it into the React Native app.
