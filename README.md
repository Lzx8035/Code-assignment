### ✅ TODO

We are evaluating you based on your front-end and/or back-end capabilities. **Failure to complete one side fully does not necessarily result in disqualification.** Please complete the task to the best of your abilities.

#### Components to Implement

You are expected to create at least **three components**:

---

#### 1. Admin Data Table View

- Create an API function that fetches data from `backend/data/funds_data.json`.
- Display the data in a table format.
- Create Filters for each property in the dataset to be able to get select values.
- Allow the admin to sort the dataset in the table; organizing by least to greatest, greatest to least.. etc
- Style the table using your best UI/UX judgment.
- When clicking on the **Name** of a data point, navigate to the **User Facing Data View**.
- Include an edit icon (e.g., a pencil) that navigates to the **Admin Edit View**.

---

#### 2. User Facing Data View

- Create an API function to fetch a **single data point** from `backend/data/funds_data.json`.
- Display all available information for that data point.
- Style the view using your best UI/UX judgment.

---

#### 3. Admin Edit View

- Create an API function to fetch and edit a **single data point** from `backend/data/funds_data.json`.
- Allow the admin to **edit** and **delete** the data.
- Automatically save changes when the admin finishes editing.
- Design the view using your best UI/UX judgment.
- You may implement this as a **separate page** or a **modal/dialog** (e.g., MatDialog).

---

### Submission

- Leave following information in the [Notes](#notes) sections below
    - Your name
    - Your email
    - Any message you want us to consider regarding to this project.
- Remove all `node_modules` folder
- Zip the project folder and send your submissions
    - To: xxx
    - CC: xxx

### Notes
- Name: Lea Liang
- Email: lzx8035@gmail.com
- Message: Here is a brief intro about my coding assignment 😀


# Funds Management Dashboard (Angular + Node.js)

## 📂 Tech Stack
### Frontend
- Angular
- TypeScript

### Backend
- Node.js + Express
- File-based storage (`funds_data.json`)
- REST API
- Postman documentation

---

## 🚀 Features

### Frontend Features
- Three main views:
  - **Admin Data Table View**
  - **User Facing Detail View**
  - **Admin Edit View**
- Dynamic filters:
  - strategies / geographies / currencies from `/api/funds/meta`
- Backend-driven:
  - filtering  
  - sorting  
  - pagination (page, pageSize, jump to page)
- Filters synced to URL params (state preserved after page refresh)
- Auto-save in Edit View (debounced PUT)
- Delete action with confirmation
- Validation for numeric filter ranges
- Toast notifications (data count, save status)
- Loading / error / empty states
- Responsive layout

---

## 🗄️ Backend Features

- REST API built with Node.js + Express
- Reads and writes to `funds_data.json`
- Backend handles all filtering, sorting, and pagination
- Metadata endpoint for dynamic dropdown options
- All endpoints tested with Postman (documentation link included)

---

## 🔌 API Endpoints

### `GET /api/funds/meta`
Returns unique lists for:
- `strategies`
- `geographies`
- `currencies`

Used by filter components.

---

### `GET /api/funds`
Returns all funds.

Supports query params:
- `page`
- `pageSize`
- `sortField`
- `sortOrder`
- filter fields (strategy, geography, currency, etc.)

---

### `GET /api/funds/:name`
Returns a single fund by name.  
Used in User Detail View + Admin Edit View.

---

### `PUT /api/funds/:name`
Updates a single fund.  
Changes are saved back to the JSON file (used by auto-save).

---

### `DELETE /api/funds/:name`
Deletes a fund and writes the updated list back to JSON.

---

## 📘 API Documentation (Postman)
View all API requests and examples:

**Postman Web Link:**  
https://supply-architect-7804003-3576417.postman.co/workspace/Lea-Liang's-Workspace~110f636f-bdfa-4e70-8f58-d1c8b2f89384/collection/47064750-000079b3-a1d5-48ee-b798-f2fd82ce7e90?action=share&creator=47064750&active-environment=47064750-e89e2841-ed36-4513-96b3-d73c3a577e11

