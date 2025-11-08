# 📊 Database Setup Guide - FocusWave

A simple step-by-step guide to set up the PostgreSQL database for FocusWave.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ PostgreSQL installed on your system
- ✅ Node.js installed (for running migrations)
- ✅ Basic terminal/command line knowledge

---

## 🚀 Quick Setup (Automatic)

### Option 1: Using the Setup Script (Recommended)

```bash
cd backend
chmod +x RUN_SETUP.sh
./RUN_SETUP.sh
```

This script will:
1. Create the `.env` file
2. Install dependencies
3. Run database migrations automatically

**Done!** Your database is ready to use.

---

## 📝 Manual Setup (Step-by-Step)

### Step 1: Install PostgreSQL

#### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or download from: https://www.postgresql.org/download/macosx/
```

#### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### Step 2: Create the Database

Open a terminal and connect to PostgreSQL:

```bash
# Connect to PostgreSQL (default user is usually 'postgres')
psql -U postgres

# If that doesn't work, try:
sudo -u postgres psql
```

In the PostgreSQL prompt, run:

```sql
-- Create the database
CREATE DATABASE focuswave;

-- Verify it was created
\l

-- Exit PostgreSQL
\q
```

**Alternative: Create database from command line**
```bash
createdb -U postgres focuswave
```

---

### Step 3: Configure Backend Environment

Navigate to the backend directory:

```bash
cd backend
```

#### Option A: Use the automatic script
```bash
chmod +x create-env.sh
./create-env.sh
```

#### Option B: Create .env file manually

Create a file named `.env` in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=focuswave
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important:** 
- Replace `your_password_here` with your PostgreSQL password
- If you don't have a password, leave `DB_PASSWORD=` empty
- For production, change `JWT_SECRET` to a secure random string

---

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 5: Run Database Migrations

This will create all the necessary tables:

```bash
npm run migrate
```

You should see:
```
🔄 Running database migrations...
✅ Database migrations completed successfully!
```

---

### Step 6: Verify Database Setup

Connect to PostgreSQL and check the tables:

```bash
psql -U postgres -d focuswave
```

In the PostgreSQL prompt:

```sql
-- List all tables
\dt

-- Check users table structure
\d users

-- Exit
\q
```

You should see these tables:
- `users`
- `tasks`
- `timer_sessions`
- `mood_logs`
- `user_gamification`

---

## ✅ Setup Complete!

Your database is now ready. You can:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Start the ML service:**
   ```bash
   cd ml_service
   ./RESTART.sh
   ```

---

## 🔧 Common Issues & Troubleshooting

### Issue 1: "Connection refused" or "Cannot connect to database"

**Solution:**
- Make sure PostgreSQL is running:
  ```bash
  # macOS
  brew services start postgresql@15
  
  # Linux
  sudo systemctl start postgresql
  
  # Windows
  # Check Services (services.msc) and start PostgreSQL service
  ```

### Issue 2: "Database 'focuswave' does not exist"

**Solution:**
- Create the database:
  ```bash
  createdb -U postgres focuswave
  ```

### Issue 3: "Password authentication failed"

**Solution:**
- Check your `.env` file and make sure `DB_PASSWORD` is correct
- If you don't have a password, leave it empty: `DB_PASSWORD=`
- On Linux, you might need to set a password:
  ```bash
  sudo -u postgres psql
  ALTER USER postgres PASSWORD 'your_password';
  ```

### Issue 4: "Permission denied" errors

**Solution (Linux/macOS):**
- Make sure your user has access to PostgreSQL:
  ```bash
  sudo -u postgres createuser -s $USER
  ```

### Issue 5: Port 5432 already in use

**Solution:**
- Check if PostgreSQL is already running:
  ```bash
  # macOS/Linux
  lsof -i :5432
  
  # Windows
  netstat -ano | findstr :5432
  ```
- If another service is using it, either stop that service or change the port in `.env`

---

## 📊 Database Schema Overview

The database includes these tables:

### 1. `users`
- Stores user account information
- Fields: id, email, password_hash, name, created_at, updated_at

### 2. `tasks`
- Stores user tasks/todos
- Fields: id, user_id, title, description, tag, priority, status, due_date, task_order, created_at, updated_at

### 3. `timer_sessions`
- Stores Pomodoro timer sessions
- Fields: id, user_id, session_type, duration, completed_at

### 4. `mood_logs`
- Stores mood journal entries
- Fields: id, user_id, mood, note, created_at

### 5. `user_gamification`
- Stores gamification data (points, levels, streaks, badges)
- Fields: id, user_id, level, points, total_points, streak, last_activity_date, unlocked_badges, created_at, updated_at

---

## 🔄 Resetting the Database

If you need to reset the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate the database
DROP DATABASE IF EXISTS focuswave;
CREATE DATABASE focuswave;
\q

# Run migrations again
cd backend
npm run migrate
```

---

## 🔐 Security Notes

1. **Never commit `.env` file to Git** - It contains sensitive information
2. **Use strong passwords** in production
3. **Change JWT_SECRET** in production to a secure random string
4. **Limit database access** - Only allow necessary users and IPs

---

## 📚 Additional Resources

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **PostgreSQL Download:** https://www.postgresql.org/download/
- **Node.js PostgreSQL Guide:** https://node-postgres.com/

---

## 🆘 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Verify PostgreSQL is running
3. Check your `.env` file configuration
4. Make sure the database exists
5. Verify your user has proper permissions

---

## ✅ Checklist

Before starting the application, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `focuswave` exists
- [ ] `.env` file is created in `backend` directory
- [ ] Database credentials in `.env` are correct
- [ ] Dependencies are installed (`npm install`)
- [ ] Migrations are run (`npm run migrate`)
- [ ] All tables are created (check with `\dt` in psql)

---

**Last Updated:** 2025-11-08
**Project:** FocusWave
**Database:** PostgreSQL

