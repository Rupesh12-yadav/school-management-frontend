# API Testing Guide

## Check if Backend is Running

1. **Open Terminal in backend folder:**
   ```bash
   cd school-management-system/backend
   npm start
   ```

2. **Check if server is running:**
   - Look for message: `✅ Server running on port 3000`
   - Look for message: `✅ MongoDB connected`

3. **Test API endpoints:**
   Open browser and go to:
   ```
   http://localhost:3000/
   ```
   Should show: "School Management API running on port 3000"

## Common Issues:

### ERR_INTERNET_DISCONNECTED
- **Cause**: Backend server not running
- **Fix**: Start backend server with `npm start`

### Port Already in Use
- **Cause**: Another process using port 3000
- **Fix**: 
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Or change port in .env file
  PORT=3001
  ```

### MongoDB Connection Error
- **Cause**: MongoDB not connected
- **Fix**: Check MONGO_URI in .env file

## API Endpoints (Updated):

### Students
- GET    `/api/admin/students/student/all`
- POST   `/api/admin/students/student/add`
- GET    `/api/admin/students/student/:id`
- PUT    `/api/admin/students/student/update/:id`
- DELETE `/api/admin/students/student/delete/:id`

### Teachers
- GET    `/api/admin/teachers/teacher/all`
- POST   `/api/admin/teachers/teacher/add`
- GET    `/api/admin/teachers/teacher/:id`
- PUT    `/api/admin/teachers/teacher/update/:id`
- DELETE `/api/admin/teachers/teacher/delete/:id`

### Events
- GET    `/api/admin/events`
- POST   `/api/admin/events`
- PUT    `/api/admin/events/:id`
- DELETE `/api/admin/events/:id`

### Notices
- GET    `/api/admin/notices`
- POST   `/api/admin/notices`
- PUT    `/api/admin/notices/:id`
- DELETE `/api/admin/notices/:id`

### Homework
- GET    `/api/admin/homework`
- POST   `/api/admin/homework`
- PUT    `/api/admin/homework/:id`
- DELETE `/api/admin/homework/:id`

### Leaves
- GET    `/api/admin/leaves`
- PUT    `/api/admin/leaves/:id`

### Classes
- GET    `/api/admin/classes`
- POST   `/api/admin/classes`
- GET    `/api/admin/classes/:id`
- PUT    `/api/admin/classes/:id`
- DELETE `/api/admin/classes/:id`

### Holidays
- GET    `/api/admin/holidays`
- POST   `/api/admin/holidays`
- DELETE `/api/admin/holidays/:id`
