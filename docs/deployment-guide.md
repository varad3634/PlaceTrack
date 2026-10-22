# PlaceTrack Production Deployment Guide (Vercel & Render)

This guide walks you through deploying **PlaceTrack** to production with:
- **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite SPA with global Edge CDN)
- **Backend API**: [Render](https://render.com) (Node.js + Express.js Web Service)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed M0 Free Cluster)

---

## Architecture Overview

```
+-------------------------------------------------------+
|                    End User Client                    |
|        (Browser: Chrome, Safari, Edge, Mobile)        |
+---------------------------+---------------------------+
                            |
           +----------------+----------------+
           | HTTPS                           | HTTPS (REST API)
           v                                 v
+---------------------+           +---------------------+
|       VERCEL        |           |       RENDER        |
|  React 19 + Vite    |           |   Node.js + Express |
|  Single Page App    |           |   REST API Server   |
|  (Global Edge CDN)  |           |   (Web Service)     |
+---------------------+           +----------+----------+
                                             | Encrypted TLS
                                             v
                                  +---------------------+
                                  |    MONGODB ATLAS    |
                                  |   Cluster0 (Cloud)  |
                                  +---------------------+
```

---

## Step 1: Set up MongoDB Atlas (Cloud Database)

1. Log in or create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Shared M0 (Free)** cluster (choose AWS or Google Cloud in your closest region).
3. **Database Access**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Create a user (e.g. `placetrack_admin`) with a secure password and `Read and write to any database` role.
4. **Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)** (Render uses dynamic IP addresses).
5. **Get Connection String**:
   - Click **Connect** > **Drivers** (Node.js).
   - Copy your connection string, which looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placetrack?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials, and database name with `placetrack`.

---

## Step 2: Deploy Backend to Render

### Option A: Via Render Web Dashboard (Recommended)

1. Sign up / Log in to [Render](https://render.com) and link your GitHub account.
2. In your Render Dashboard, click **New +** > **Web Service**.
3. Select your repository: `varad3634/PlaceTrack`.
4. Configure the Web Service settings:
   - **Name**: `placetrack-backend` (or your preferred name)
   - **Region**: Choose the region closest to your MongoDB Atlas cluster (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: `server` ⚠️ *(Crucial!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Expand **Advanced** and add the following **Environment Variables**:

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` | (Or Render default `10000`) |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | *(Generate a random 32+ character string)* | Secret for signing tokens |
| `JWT_EXPIRE` | `7d` | Token expiration period |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Leave blank or set after deploying frontend |

6. Set **Health Check Path** (under Advanced):
   - Path: `/health`
7. Click **Create Web Service**.
8. Wait 2–3 minutes. Once deployment finishes, Render gives you a live URL, for example:
   `https://placetrack-backend.onrender.com`
9. Test by visiting `https://your-backend.onrender.com/health` in your browser. You should see:
   ```json
   {
     "status": "success",
     "service": "PlaceTrack Backend API"
   }
   ```
   *(Note: On the first boot, PlaceTrack automatically seeds initial demonstration data if the database is empty!)*

---

## Step 3: Deploy Frontend to Vercel

1. Sign up / Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** > **Project**.
3. Import your repository: `varad3634/PlaceTrack`.
4. Configure the Project:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and select `client` ⚠️ *(Crucial!)*
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
5. Expand **Environment Variables** and add:

| Name | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Your live Render backend URL from Step 2 |

6. Click **Deploy**.
7. Vercel will build and deploy your React SPA in ~30–45 seconds!
8. Once complete, you will receive your production URL (e.g. `https://placetrack.vercel.app`).

---

## Step 4: Final Touch (Update CORS in Render)

Now that your Vercel URL is live:
1. Go back to your [Render Dashboard](https://dashboard.render.com) > `placetrack-backend` > **Environment**.
2. Add or update:
   - `CLIENT_URL`: `https://your-frontend.vercel.app` (your actual Vercel domain)
3. Render will automatically redeploy with the updated CORS policy.

---

## Step 5: Test & Verify

Log in to your live frontend using the pre-seeded credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@placetrack.edu` | `Password@123` |
| **TPO Coordinator** | `tpo@placetrack.edu` | `Password@123` |
| **Student (Placed)** | `rahul.sharma@student.edu` | `Password@123` |
| **Student (Applicant)** | `amit.kumar@student.edu` | `Password@123` |
