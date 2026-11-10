# Yalla Shirim backend (Hetzner)

Streams private Google Drive audio with HTTP Range support. Users sign in with Google (via the existing Supabase login);
the server lets only **manually approved emails** stream. Everyone else sees "Waiting for admin approval".

## How access works
1. User signs in on the site -> the site calls `POST /auth/session` with the Supabase token -> server sets an HttpOnly cookie
   and records the email in `access_users` (`is_approved = false` if new).
2. Every `GET /stream/:id` checks `is_approved` in the database (cached ~10 s; admin changes clear it immediately).
   Not approved -> **403** `{error:"not_approved", message:"Waiting for admin approval", message_he:"ממתין לאישור מנהל"}`.
3. The admin approves at `https://api.yourdomain.com/admin` (or by toggling `is_approved` in Supabase Table Editor).

## Endpoints
| Method | Path | What |
|---|---|---|
| POST | /auth/session | body `{access_token}` (Supabase session token) -> cookie; returns `{email, approved, isAdmin, message?}` |
| POST | /auth/logout | clears the cookie |
| GET | /me | `{email, approved, isAdmin}` |
| GET/HEAD | /stream/:driveFileId | audio. 401 not logged in, **403 not approved**, 206/200 otherwise |
| GET | /admin | admin page (admin emails only, from `ADMIN_EMAILS`) |
| GET | /admin/api/users?status=pending\|approved\|all | list |
| POST | /admin/api/approve | `{email}` or `{emails:[...]}` or `{text:"pasted list"}`; works before the user ever signs in |
| POST | /admin/api/revoke | same body; the admin cannot revoke themselves |

## Run
```
cp .env.example .env     # fill it in
docker compose up -d --build
curl https://api.yourdomain.com/health
```
Run `sql/access.sql` once in Supabase (SQL Editor).

## Tests
`npm install && npm test` (fake Drive + in-memory store; no real accounts needed).
