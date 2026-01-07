# IT Academy – Sprint N°9: React Project

## 🌐 Animal Shelter CMS App

This project is a **React (Vite) application** that evolves the previous sprint into a more complete **Content Management System** for an animal shelter.

It focuses on:

- A **public website** (home, pages, posts, calendar).
- An **admin dashboard** with different roles (**user, editor, admin**).
- A **booking system** for veterinary appointments using **FullCalendar**.
- A **block-based home builder** similar to a lightweight page builder (hero, columns, images, etc.).
- Authentication, authorization and storage powered by **Supabase**.

---

## ✨ Purpose

The main goals of this sprint are:

- Learn how to build a **small CMS** on top of Supabase using React + TypeScript.
- Work with **roles and permissions** (public user, authenticated user, editor, admin).
- Manage **dynamic content** (pages, posts, home layout) through a dashboard.
- Implement a **calendar booking system** backed by PostgreSQL and RLS policies.

---

## 🧠 Key Features

### 🏠 Public Site & Home Builder

- Public routes:
  - `/` – Home
  - `/calendar` – Booking calendar
  - `/pages` & `/pages/:slug`
  - `/posts` & `/posts/:slug`
  - `/login`, `/register`, `/emailconfirmation`, `/profile`
- Home page powered by a dedicated `home_content` table in Supabase:
  - **Hero block** with title, subtitle, button and optional background image.
  - **Heading**, **paragraph** and **image** blocks.
  - **Columns block** with up to 4 columns, each containing its own inner blocks.
- Custom block system:
  - Drag & drop using **dnd-kit**.
  - Block editor for each type (hero, image with upload, rich text, etc.).
  - Home is edited from the dashboard and rendered on the public `/`.

### ✏️ Pages & Posts Management (Dashboard)

- Separate management for:
  - **Pages** (`pages` table).
  - **Posts** (sharing the same structure as pages with an optional category).
- Common features:
  - Title, slug, excerpt, SEO fields.
  - Blocks array stored as `jsonb`.
  - Cover image path stored in Supabase Storage.
- Only **editors** and **admins** can access the content management section of the dashboard.

### 🧱 Block System & Editors

- Shared `Block` types defined in `contentTypes`:
  - `heading`, `paragraph`, `image`, `richtext`, `hero`, `columns`.
- **BlocksEditorDnd**:
  - Drag & drop ordering.
  - Add / remove blocks.
  - Block-level editors:
    - `Hero` editor with alignment, button label/URL and background image.
    - `Image` editor with upload to Supabase Storage (max size limit, lazy loading).
    - `Paragraph` using a rich text editor (Lexical-based) for better formatting.
- **BlocksRenderer**:
  - Renders the JSON structure into styled HTML on the public site.
  - Supports nested blocks inside columns.

### 📅 Booking Calendar (Supabase + FullCalendar)

- Appointment system using **FullCalendar** + **Luxon**:
  - Weekly and monthly views.
  - Time slots between 07:00 and 20:00 (no all-day slots).
- **Bookings** stored in the `bookings` table in Supabase:
  - `user_id`, `resource`, `title`, `start_time`, `end_time`, `profile_id`.
- A PostgreSQL function `is_available` validates that a time slot is free before:
  - Creating a booking.
  - Updating or moving a booking (drag & drop / resize).
- Realtime updates:
  - Supabase Realtime channel listens to `INSERT`, `UPDATE`, `DELETE` on `bookings`.
  - Calendar updates automatically across open clients.

#### Booking Permissions

- **Normal user**:
  - Can create, edit and delete **only their own** bookings.
  - Cannot drag / resize or open the modal for other users’ bookings.
- **Admin**:
  - Can see and manage **all** bookings.
  - Can drag / resize any event.
  - Special rules enforced via:
    - React hooks (`useBookingCalendar`, `useBookingModal`).
    - Supabase Row Level Security (RLS) policies on `bookings`.

### 👥 Users, Roles & Admin Area

- Custom `users` table linked to `auth.users`:
  - `id`, `username`, `email`, `role` (`user`, `editor`, `admin`), `created_at`.
  - Constraint to ensure the role is always one of the allowed values.
- `admins` table:
  - Stores the IDs of users that are considered platform admins.
  - Used by the `useIsAdmin` hook to quickly check if the current user is an admin.
- Roles in the app:
  - **user** – standard authenticated user:
    - Can manage their own bookings.
    - Can view public content.
  - **editor** – content editor:
    - Can access the dashboard to manage **home, pages, posts**.
    - Cannot access user management.
  - **admin** – full administrator:
    - Everything an editor can do.
    - Access to **User Management**.
    - Can manage all bookings.
- Routes protection:
  - `RequireAuth` protects the whole dashboard.
  - `RequireRole` used both at dashboard level and on specific routes:
    - `/dashboard` – `editor` or `admin`.
    - `/dashboard/users` – **admin only**.

### 👤 User Management (Admin)

- `UserManagement` page under `/dashboard/users`:
  - Accessible only for admins (via `RequireRole`).
  - Planned features for CRUD:
    - List all users from the `users` table.
    - Change user role (`user`, `editor`, `admin`).
    - Enable / disable users (soft disable so data stays in Supabase).
    - (Later) invite users via email using Supabase auth (magic link / invite flow).
- For now, admin assignment can also be done manually by inserting rows into `admins`.

### 🔐 Authentication & Storage (Supabase)

- Auth:
  - Login and register flow using Supabase Auth (`/login`, `/register`).
  - Email confirmation flow (`/emailconfirmation`).
- Storage:
  - Image uploads (e.g. home hero background, image blocks, cover images) to Supabase Storage.
  - RLS storage policies so that only editors/admins can upload content images through the dashboard.
  - Images are rendered publicly with lazy loading for performance.

---

## 🏗️ Technologies Used

- ⚛️ **React** (Vite)
- 🧩 **TypeScript**
- 💅 **Tailwind CSS** for styling
- 💾 **Supabase**
  - Auth (email-based registration & login)
  - Database (PostgreSQL)
  - Realtime (bookings updates)
  - Storage (images for content)
- 📅 **FullCalendar** + **Luxon** for calendar UI and date/time handling
- 🧱 **dnd-kit** for drag & drop blocks
- ✍️ **Lexical** as rich text editor foundation
- 🧪 **Vitest & React Testing Library** (planned tests for core flows)

---

## 📦 Installation & Setup

1. Clone this repository:
```
git clone https://github.com/EdgarZerpaZG/sprint-9-react.git
```

2. Navigate to the project directory:
```
cd sprint-9-react
```

3. Run in the terminal:
```
npm install
npm run dev
```

4. Open the localhost url:
- Example: http://localhost:5173/


5. Configure environment variables in a .env file (Vite style), for example:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


6. Make sure your Supabase project has the required tables:
- home_content
- pages
- booking
- users
- admins
- The is_available PostgreSQL function and RLS policies for each table.


5. Additional feature with Testing(Vitest and React Testing), open the terminal and run:
```
sprint-8-react/ npm run test
```