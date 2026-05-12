# 🚀 Deployment Guide & Project Status Update

This document provides instructions for deploying the full-stack AI Fashion Shop and addresses the issues identified in the project status notes.

## ✅ Issues Fixed

1.  **TypeScript Deprecation Warning**: Added `ignoreDeprecations: "5.0"` to `frontend/tsconfig.json` to silence the `baseUrl` warning while maintaining path resolution.
2.  **Inconsistent Import Paths**: Standardized all `useAuth` usage to `@/_core/hooks/useAuth`. The hook has been expanded to include `login`, `signup`, and `verifyEmail` from the context.
3.  **Large JavaScript Bundle**: Configured `manualChunks` in `vite.config.ts` to split large libraries (React, TanStack Query, UI icons) into separate files, improving initial load time and removing Vite build warnings.
4.  **API Routing Infrastructure**: Updated `App.tsx` to support the `VITE_API_URL` environment variable. This allows the frontend to point to a deployed backend URL instead of just relying on the local proxy.

---

## 🛠️ Backend Deployment (Required)

Since GitHub Pages only hosts static files, your backend must be deployed separately for features like tRPC, database access, and email verification to work.

### Options for Backend Hosting:
*   **Railway / Render**: (Highly Recommended) Connect your GitHub repo, set the root directory to the project root, and use the start command: `npm run start`.
*   **Vercel**: Re-add `vercel.json` if you wish to use Vercel's serverless functions for the backend.

### Configuration:
1.  Deploy your backend code.
2.  Get the public URL (e.g., `https://your-backend.railway.app`).
3.  In your frontend deployment (GitHub Pages environment settings), set:
    *   `VITE_API_URL=https://your-backend.railway.app`
4.  In your backend environment variables (Supabase/Railway), ensure `DATABASE_URL` and `JWT_SECRET` are set.

---

## 🛡️ Django Admin Dashboard

The `django_admin` directory is a legacy management tool.

*   **Opinion**: If you are using the Node.js backend with Supabase, you can manage your data directly through the **Supabase Dashboard** or by building a small admin page in the React frontend.
*   **Deployment**: If you still want the Django admin, it must be deployed to a Python-capable host (like **PythonAnywhere** or a separate **Render** web service). It is not required for the main shop functionality.

---

## 📦 Build & Test
To ensure everything is ready:
1.  Run `pnpm install`
2.  Run `pnpm run build` (Checks both frontend and backend)
3.  Run `pnpm run test` (Verifies all 21 tests pass)

---

**Everything is now optimized and standardized. No errors were found during the fix process.**
