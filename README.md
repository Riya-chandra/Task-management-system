# Task Management System

A clean and user-friendly **Task Management Mobile Application** built using **Flutter & Dart**, focused on smooth UX, proper state management, and maintainable code.

---

## 🚀 Overview

This project is developed as part of the **Flodo AI Take-Home Assignment**.

The app allows users to:
- Create and manage tasks
- Track progress using status
- Handle dependencies between tasks
- Search and filter tasks efficiently

---

## 🛠️ Tech Stack

- **Frontend:** Flutter (Dart)
- **Database:** (Update this – SQLite / Hive / Isar)
- **State Management:** (Update this – Provider / Riverpod / Bloc)

---

## 📱 Features

### ✅ Core Features

- ➕ Create Task  
- 📖 View All Tasks  
- ✏️ Edit Task  
- ❌ Delete Task  

---

### 🧩 Task Model

Each task contains:

- **Title**
- **Description**
- **Due Date**
- **Status**
  - To-Do  
  - In Progress  
  - Done  
- **Blocked By (Optional)** – Dependency on another task

---

### 🎯 Dependency Handling

- If a task is blocked by another task:
  - It appears **greyed out**
  - It becomes active only when the blocking task is marked **Done**

---

### 🔍 Search & Filter

- Search tasks by **Title**
- Filter tasks by:
  - To-Do  
  - In Progress  
  - Done  

---

### 💾 Draft Persistence

- If user leaves the task creation screen:
  - Data is **saved automatically**
  - Draft is restored when user returns

---

### ⏳ Async Handling

- Simulated **2-second delay** on:
  - Task Creation  
  - Task Update  

During this:
- Loader is shown  
- UI remains responsive  
- Save button is disabled  

---

## 🎨 UI/UX Highlights

- Clean and minimal design  
- Proper spacing and alignment  
- Smooth transitions  
- Visual feedback for loading and disabled states  

---

## 🧪 Stretch Goal

(Update this based on what you implemented)

Example:

- Debounced search with highlight  
OR  
- Drag and drop with persistence  
OR  
- Recurring task logic  

---

## 📂 Project Structure

