# Database Setup Guide — AI Fashion Shop

This guide explains **step by step** how to set up the MySQL database for the AI Fashion Shop project on your local machine.

---

## Option 1: Using XAMPP (Recommended for Beginners)

### Step 1: Install XAMPP

1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install it and open the **XAMPP Control Panel**
3. Start **Apache** and **MySQL** by clicking the "Start" buttons

### Step 2: Create the Database

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **"New"** in the left sidebar
3. Type the database name: `fashion_shop`
4. Set collation to: `utf8mb4_unicode_ci`
5. Click **"Create"**

### Step 3: Configure the Project

1. In the project root folder, create a file called `.env`
2. Add the following content:

```env
DATABASE_URL=mysql://root:@localhost:3306/fashion_shop
```

> **Note:** If your MySQL has a password, replace the empty space after `:` with your password.
> Example: `mysql://root:mypassword@localhost:3306/fashion_shop`

### Step 4: Install Dependencies

Open a terminal in the project root folder and run:

```bash
npm install
```

### Step 5: Create the Database Tables

Run the following command to create all the tables automatically:

```bash
npm run db:push
```

This creates these tables in your `fashion_shop` database:
- `products` — stores all fashion items
- `users` — stores user accounts
- `orders` — stores customer orders
- `cart_items` — stores shopping cart data
- `favorites` — stores user wishlists

### Step 6: Seed the Database with Products

Run the following command to fill the database with the product catalog:

```bash
npm run db:seed
```

This will insert all products from the catalog, including the corrected images (each product now shows the correct image for its category).

---

## Option 2: Using MySQL Workbench

### Step 1: Install MySQL Server

1. Download MySQL Community Server from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. During installation, set a **root password** and remember it

### Step 2: Create the Database in MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Click the **"+"** button to create a new schema
4. Name it `fashion_shop`
5. Click **"Apply"** then **"Finish"**

### Step 3: Configure the Project

Create a `.env` file in the project root:

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/fashion_shop
```

Replace `YOUR_PASSWORD` with the password you set during MySQL installation.

### Step 4: Run Setup Commands

```bash
npm install
npm run db:push
npm run db:seed
```

---

## Starting the Full Project

After the database is set up, you need to run **three separate services**:

### Service 1: Node.js Backend (API Server)

```bash
# In the project root folder
npm run dev
```

This starts the backend API on port **5000**.

### Service 2: React Frontend

```bash
# In the project root folder (separate terminal)
npm run frontend:dev
```

This starts the frontend on port **5173**.

### Service 3: Django Admin Dashboard

```bash
# In the django_admin folder
cd django_admin
python manage.py runserver 8000
```

This starts the admin dashboard on port **8000**.

> **Admin Login:** Username: `admin` | Password: `admin123`
> 
> **Important:** Change the admin password after first login!

---

## Connecting Django to MySQL

By default, the Django admin uses SQLite (for easy local testing). To connect it to the same MySQL database as the Node.js backend:

1. Copy `django_admin/.env.example` to `django_admin/.env`
2. Update the `DATABASE_URL` to match your MySQL connection:

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/fashion_shop
```

3. Run migrations:

```bash
cd django_admin
python manage.py migrate
python manage.py createsuperuser
```

---

## Exporting the Database (for Backup or Sharing)

### Using phpMyAdmin

1. Go to `http://localhost/phpmyadmin`
2. Click on `fashion_shop` in the left sidebar
3. Click **"Export"** in the top menu
4. Choose **"Quick"** export method
5. Format: **SQL**
6. Click **"Export"** — this downloads a `.sql` file

### Using Command Line

```bash
mysqldump -u root -p fashion_shop > fashion_shop_backup.sql
```

---

## Importing the Database (from a Backup)

### Using phpMyAdmin

1. Go to `http://localhost/phpmyadmin`
2. Create a new database called `fashion_shop` (if it doesn't exist)
3. Click on `fashion_shop` in the left sidebar
4. Click **"Import"** in the top menu
5. Click **"Choose File"** and select your `.sql` backup file
6. Click **"Import"** at the bottom

### Using Command Line

```bash
mysql -u root -p fashion_shop < fashion_shop_backup.sql
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Access denied for user 'root'@'localhost'` | Check your MySQL password in the `.env` file |
| `Unknown database 'fashion_shop'` | Create the database first using phpMyAdmin or MySQL Workbench |
| `ECONNREFUSED` error | Make sure MySQL is running (check XAMPP Control Panel) |
| `Table 'products' doesn't exist` | Run `npm run db:push` to create the tables |
| Django admin shows no products | Run `python manage.py migrate` then `python manage.py runserver 8000` |
| Port 8000 already in use | Stop any other service using port 8000 and restart Django |
