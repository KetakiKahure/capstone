# 🎉 FocusWave - Simple Setup Guide

**Hello! 👋** This guide will help you set up FocusWave step by step.  
Think of it like building with blocks - we'll do one piece at a time!

---

## 📚 What You Need First (Like Getting Your Tools Ready)

Before we start, you need these things on your computer:

### ✅ Checklist - Do You Have These?

- [ ] **Node.js** - This runs the website code
- [ ] **Python 3** - This runs the AI/ML code  
- [ ] **PostgreSQL** - This is like a filing cabinet for data
- [ ] **A code editor** - Like VS Code (optional, but helpful!)

**Don't have them?** No worries! We'll help you install them. 👇

---

## 🛠️ Step 1: Install the Tools (Like Getting Your Building Blocks)

### 🔵 Install Node.js

**What is Node.js?** It's like a translator that helps your computer understand website code.

**How to install:**

1. Go to: https://nodejs.org/
2. Download the version that says "LTS" (it means "Long Term Support" - the stable one!)
3. Install it (just click Next, Next, Next like any other program)
4. Open your terminal/command prompt
5. Type this to check if it worked:
   ```bash
   node --version
   ```
   You should see a number like `v20.10.0` - that means it worked! ✅

**If you see an error:** Make sure you restarted your terminal after installing!

---

### 🐍 Install Python 3

**What is Python?** It's the language the AI uses to think and learn!

**How to install:**

1. Go to: https://www.python.org/downloads/
2. Download Python 3.11 or newer
3. **IMPORTANT:** When installing, check the box that says "Add Python to PATH"
4. Install it
5. Open your terminal
6. Type this to check:
   ```bash
   python3 --version
   ```
   You should see something like `Python 3.11.5` - that means it worked! ✅

**If you see an error:** 
- On Windows, try `python --version` instead of `python3`
- Make sure you checked "Add Python to PATH" when installing

---

### 🐘 Install PostgreSQL (The Database)

**What is PostgreSQL?** It's like a super organized filing cabinet that stores all your app's information.

#### 🍎 On Mac (macOS):

1. Open your terminal
2. Type this (if you have Homebrew):
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```
   
   **Don't have Homebrew?** Install it first:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

#### 🪟 On Windows:

1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer
3. Install it (remember the password you set for the `postgres` user!)
4. PostgreSQL should start automatically

#### 🐧 On Linux (Ubuntu/Debian):

1. Open your terminal
2. Type this:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

**How to check if it's working:**

```bash
# Try to connect to PostgreSQL
psql -U postgres

# If it asks for a password, enter the one you set (or press Enter if no password)
# If you see something like "postgres=#", it worked! ✅
# Type \q and press Enter to exit
```

---

## 📁 Step 2: Get the FocusWave Code

**What we're doing:** Getting all the FocusWave files on your computer!

1. **If you have the code already:** Great! Skip to Step 3! ✅

2. **If you need to download it:**
   - Open your terminal
   - Go to where you want to put the project (like your Desktop)
   - Use Git to download it (if you have Git):
     ```bash
     git clone https://github.com/Abraz07/capstone.git
     cd capstone
     ```

---

## 🗄️ Step 3: Set Up the Database (Like Organizing Your Filing Cabinet)

**What we're doing:** Creating the database where FocusWave will store information.

### Step 3.1: Create the Database

1. Open your terminal
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
   
   **If it asks for a password:** Enter the password you set when installing PostgreSQL
   
   **If it says "command not found":** 
   - On Windows, you might need to use the PostgreSQL command line from the Start menu
   - On Mac/Linux, make sure PostgreSQL is running

3. Once you're in PostgreSQL (you'll see `postgres=#`), type:
   ```sql
   CREATE DATABASE focuswave;
   ```
   
   You should see: `CREATE DATABASE` ✅

4. Check if it was created:
   ```sql
   \l
   ```
   
   You should see `focuswave` in the list! ✅

5. Exit PostgreSQL:
   ```sql
   \q
   ```

**🎉 Great! Your database is created!**

---

### Step 3.2: Set Up the Backend (The Middle Part)

**What we're doing:** Setting up the part that connects your website to the database.

1. Open your terminal
2. Go to the backend folder:
   ```bash
   cd backend
   ```

3. **Easy way - Use the setup script:**
   ```bash
   chmod +x RUN_SETUP.sh
   ./RUN_SETUP.sh
   ```
   
   This script does everything for you! ✅
   
   **What it does:**
   - Creates a `.env` file (configuration file)
   - Installs all the needed packages
   - Creates all the database tables
   
4. **If the script worked:** You'll see "🎉 Setup Complete!" - Skip to Step 4! ✅

5. **If you need to do it manually:**
   
   a. Create the `.env` file:
      ```bash
      # On Mac/Linux, you can use the create script:
      chmod +x create-env.sh
      ./create-env.sh
      
      # Or create it manually - make a file called .env in the backend folder with this content:
      ```
      PORT=5000
      NODE_ENV=development
      DB_HOST=localhost
      DB_PORT=5432
      DB_NAME=focuswave
      DB_USER=postgres
      DB_PASSWORD=your_password_here
      JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
      JWT_EXPIRE=7d
      CORS_ORIGIN=http://localhost:3000
      ```
      **Replace `your_password_here` with your PostgreSQL password!**
      
   b. Install packages:
      ```bash
      npm install
      ```
      
   c. Create database tables:
      ```bash
      npm run migrate
      ```

**🎉 Great! Your backend is set up!**

---

## 🤖 Step 4: Set Up the ML Service (The AI Brain)

**What we're doing:** Setting up the AI that gives smart suggestions!

1. Open your terminal
2. Go to the ML service folder:
   ```bash
   cd ml_service
   ```

3. **Easy way - Use the setup script:**
   ```bash
   chmod +x RESTART.sh
   ./RESTART.sh
   ```
   
   This will:
   - Create a Python virtual environment (like a separate room for Python packages)
   - Install all the AI/ML packages
   - Start the ML service
   
4. **What you should see:**
   ```
   🚀 Starting ML Service on http://localhost:8001
   📚 API docs: http://localhost:8001/docs
   ```
   
   **This means it's working!** ✅
   
   **Keep this terminal open!** The ML service needs to keep running.

5. **Optional - Add Gemini API Key (for better AI):**
   ```bash
   chmod +x add_gemini_key.sh
   ./add_gemini_key.sh
   ```
   
   Follow the instructions to add your Gemini API key.
   **Don't have a key?** That's okay! The app will still work with fallback suggestions.

**🎉 Great! Your ML service is running!**

---

## 🎨 Step 5: Set Up the Frontend (The Website You See)

**What we're doing:** Setting up the pretty website you'll see in your browser!

1. **Open a NEW terminal window** (keep the ML service running in the first one!)
2. Go to the main project folder:
   ```bash
   cd /path/to/capstone
   # Replace /path/to/capstone with where you put the project
   ```

3. Install the frontend packages:
   ```bash
   npm install
   ```
   
   This might take a few minutes - be patient! ⏳
   
   You should see lots of text scrolling, then "added X packages" ✅

4. **That's it for setup!** Now let's run everything! 🚀

---

## 🚀 Step 6: Run Everything (Making It All Work Together!)

**What we're doing:** Starting all three parts so they can talk to each other!

### 🎯 You Need 3 Terminal Windows Open:

---

### Terminal 1: ML Service (The AI Brain) 🧠

**Keep this running from Step 4!**

If it's not running:
```bash
cd ml_service
./RESTART.sh
```

**You should see:**
```
🚀 Starting ML Service on http://localhost:8001
```

**✅ Good! Leave this running!**

---

### Terminal 2: Backend (The Middle Part) 🔄

1. Open a **NEW** terminal window
2. Go to the backend folder:
   ```bash
   cd backend
   ```

3. Start the backend:
   ```bash
   npm run dev
   ```

**You should see:**
```
Server running on port 5000
✅ Connected to PostgreSQL database
```

**✅ Good! Leave this running!**

---

### Terminal 3: Frontend (The Website) 🎨

1. Open a **NEW** terminal window
2. Go to the main project folder:
   ```bash
   cd /path/to/capstone
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

**You should see:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**✅ Perfect!**

---

## 🌐 Step 7: Open FocusWave in Your Browser!

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to: **http://localhost:3000**
3. **🎉 You should see FocusWave!**

---

## 🎊 You Did It! 🎊

**Congratulations!** FocusWave is now running! 

### What You Should See:

- ✅ **Terminal 1:** ML Service running on port 8001
- ✅ **Terminal 2:** Backend running on port 5000  
- ✅ **Terminal 3:** Frontend running on port 3000
- ✅ **Browser:** FocusWave website open at http://localhost:3000

### What to Do Next:

1. **Create an account** - Click "Register" and make an account
2. **Login** - Use your new account to log in
3. **Explore!** - Try the Pomodoro timer, tasks, mood journal, and analytics!

---

## 🆘 Having Problems? (Troubleshooting)

### Problem 1: "Command not found" or "npm: command not found"

**Solution:** Node.js isn't installed or not in your PATH
- Go back to Step 1 and install Node.js
- Make sure to restart your terminal after installing

---

### Problem 2: "python3: command not found"

**Solution:** Python isn't installed or not in your PATH
- Go back to Step 1 and install Python
- On Windows, try `python` instead of `python3`
- Make sure you checked "Add Python to PATH" when installing

---

### Problem 3: "psql: command not found"

**Solution:** PostgreSQL isn't installed or not running
- Go back to Step 1 and install PostgreSQL
- Make sure PostgreSQL is running:
  - **Mac:** `brew services start postgresql@15`
  - **Linux:** `sudo systemctl start postgresql`
  - **Windows:** Check Services (services.msc) and start PostgreSQL

---

### Problem 4: "Database 'focuswave' does not exist"

**Solution:** The database wasn't created
- Go back to Step 3.1
- Make sure you typed `CREATE DATABASE focuswave;` correctly
- Check with `\l` in psql to see if it exists

---

### Problem 5: "Connection refused" or "Cannot connect to database"

**Solution:** PostgreSQL isn't running or wrong password
- Make sure PostgreSQL is running (see Problem 3)
- Check your `.env` file in the `backend` folder
- Make sure `DB_PASSWORD` is correct (or empty if you don't have a password)

---

### Problem 6: "Port 5000 already in use" or "Port 8001 already in use"

**Solution:** Something else is using that port
- Close other programs using those ports
- Or change the port in the `.env` file
- Or stop the other service using that port

---

### Problem 7: "npm install" takes forever or fails

**Solution:** 
- Check your internet connection
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again
- On Windows, you might need to run terminal as Administrator

---

### Problem 8: ML Service won't start

**Solution:**
- Make sure Python 3 is installed (check with `python3 --version`)
- Make sure you're in the `ml_service` folder
- Try: `chmod +x RESTART.sh && ./RESTART.sh`
- Check the error message - it usually tells you what's wrong

---

### Problem 9: "Module not found" errors

**Solution:**
- Make sure you ran `npm install` in the correct folders
- For ML service, make sure the virtual environment is activated
- Try deleting `node_modules` and running `npm install` again

---

### Problem 10: Website shows errors or won't load

**Solution:**
- Make sure all 3 services are running (check all 3 terminals)
- Make sure you're going to http://localhost:3000 (not 3001 or other port)
- Check the browser console for errors (Press F12, look at Console tab)
- Make sure the backend is running on port 5000
- Make sure the ML service is running on port 8001

---

## 📝 Quick Reference Card

### Start Everything (3 Terminals):

**Terminal 1 - ML Service:**
```bash
cd ml_service
./RESTART.sh
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

### Stop Everything:

- Press `Ctrl + C` in each terminal window
- Close the terminals

### Restart Everything:

- Just run the start commands again in each terminal!

---

## 🎓 Understanding What Each Part Does

### 🧠 ML Service (Port 8001)
- **What it does:** The AI brain that gives smart suggestions
- **Why you need it:** Makes the Pomodoro timer smarter and gives mood suggestions
- **What happens if it's not running:** The app works, but AI features won't work

### 🔄 Backend (Port 5000)
- **What it does:** The middle person that connects everything
- **Why you need it:** Takes requests from the website and talks to the database
- **What happens if it's not running:** The website won't work at all

### 🎨 Frontend (Port 3000)
- **What it does:** The pretty website you see and interact with
- **Why you need it:** This is what you actually use!
- **What happens if it's not running:** You can't see or use the app

### 🗄️ Database (PostgreSQL)
- **What it does:** Stores all your data (users, tasks, moods, etc.)
- **Why you need it:** Without it, nothing can be saved
- **What happens if it's not running:** The backend can't save or load data

---

## ✅ Final Checklist

Before you start using FocusWave, make sure:

- [ ] Node.js is installed (`node --version` works)
- [ ] Python 3 is installed (`python3 --version` works)
- [ ] PostgreSQL is installed and running
- [ ] Database `focuswave` exists
- [ ] Backend `.env` file is created
- [ ] All packages are installed (`npm install` in both backend and root)
- [ ] ML service packages are installed
- [ ] All 3 services are running (3 terminal windows)
- [ ] Website opens at http://localhost:3000

**If all checkboxes are checked, you're ready to go! 🚀**

---

## 🎉 Congratulations!

You've successfully set up FocusWave! 

**Now you can:**
- ✅ Use the Pomodoro timer
- ✅ Manage your tasks
- ✅ Track your mood
- ✅ See your analytics
- ✅ Get AI-powered suggestions
- ✅ Earn points and badges!

**Enjoy using FocusWave! 🎊**

---

## 📞 Need More Help?

1. Check the error messages - they usually tell you what's wrong
2. Make sure all prerequisites are installed
3. Make sure all services are running
4. Check the terminal windows for error messages
5. Try restarting everything (close all terminals, start fresh)

**Remember:** Setting up a project takes time the first time. Don't worry if it takes a while! You're doing great! 💪

---

**Last Updated:** 2025-11-08  
**Project:** FocusWave  
**Version:** 1.0

**Good luck! You've got this! 🌟**

