# Blossom Snaps

A React photography website backed by a plain PHP/MySQL API. Visitors can explore separate Portfolio (`/portfolio`), Services (`/services`), About (`/about`), Stories (`/stories`), and Contact (`/contact`) pages. Administrators create private client galleries and select individual images or videos for the public portfolio. Clients receive a unique private gallery link and a separate access code.

## Requirements

- PHP 8.1+ with PDO MySQL, Fileinfo, mbstring, and ZipArchive enabled
- MySQL 8+ or MariaDB 10.5+
- Node.js 18+ and npm for building the React frontend
- Apache with `mod_rewrite` for the provided shared-hosting routing rules

## Local development

1. Create a MySQL database and import `database.sql`.
2. Copy `.env.example` to `.env` and set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `APP_URL=http://localhost:5173`, and `STORAGE_PATH` to a writable directory outside `public`. The PHP API and admin creation script load this local `.env` file.
3. Create an administrator password and account:

   ```powershell
   $env:ADMIN_PASSWORD = "use-a-long-unique-password"
   php scripts\create-admin.php admin@example.com
   Remove-Item Env:ADMIN_PASSWORD
   ```

4. Start the PHP API in one terminal (upload limits allow one file up to 512 MiB):

   ```powershell
   .\scripts\start-local-api.ps1
   ```

5. In another terminal, install frontend dependencies and start Vite:

   ```powershell
   npm install
   npm run dev
   ```

Open the address printed by Vite. It proxies API requests to the PHP server and serves the React page for client gallery links. The private studio sign-in is at `/studio-room`; it is intentionally absent from public navigation. Authentication and API authorization protect studio actions.

## Shared hosting deployment

1. Create a MySQL database and import `database.sql` using the hosting control panel.
2. Build the frontend locally with `npm install` and `npm run build`.
3. Upload the contents of `public` (including its `api` directory, built assets, `.htaccess`, and `index.html`) to the hosting account's document root. Upload the root-level `api`, `scripts`, and `database.sql` directories/files outside the document root as well; the API endpoints load their shared PHP bootstrap from that private source directory.
4. Configure the PHP environment variables shown in `.env.example` in the hosting control panel. PHP does not read `.env.example` automatically. Use an absolute `STORAGE_PATH` outside the document root and make it writable by PHP.
5. Run `scripts\create-admin.php` from the hosting account's CLI with the database environment variables and `ADMIN_PASSWORD` set. Do not leave the password in a web-accessible file.
6. Ensure PHP upload limits are `upload_max_filesize=512M` and `post_max_size=600M` or higher. The default application limit is 512 MiB per file.
7. Enable HTTPS. Client gallery links are the public site URL plus `/project/<private-id>`; the separately generated code should be sent to the client through a different channel.

The upload files are stored outside the public document root and served only through the access-checked media endpoint. `public/.htaccess` enables the React single-page routes; if the host uses Nginx, configure an equivalent fallback to `index.html` while preserving PHP API routing.

For an existing installation, run `scripts/migrate-showcase.sql` once before deploying. Existing media stays private by default. The migration adds per-image showcase controls and separate public titles/captions, so private client names and descriptions are not exposed in portfolio responses.

Existing installations must also create the homepage settings table once if it does not already exist:

```sql
CREATE TABLE site_settings (
    setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Included features

- Password-hashed administrator accounts and session-based sign-in
- CSRF-protected administrator actions
- Private projects with cryptographically random share IDs and one-time displayed access codes
- Private photo/video storage and MIME-checked uploads
- Individual media approval for the public portfolio; unselected files remain private
- Client galleries unlocked by their access code, with protected individual media and full-album ZIP downloads
- Public portfolio, services, about, stories, and contact sections
- Editable public homepage text, metadata, enquiries email, and optional HTTPS hero image
- Public articles with publish/draft status and admin editing
- Separate studio sign-in and dashboard, omitted from public navigation
- Responsive React frontend and Apache shared-hosting routing
- Tailwind CSS utility styling for the client gallery and private studio

## Frontend layout

- `frontend/app` selects the public, private client, or studio experience from the URL.
- `frontend/public` contains public website pages and portfolio/story components.
- `frontend/client` contains the access-code form, private gallery, and media cards.
- `frontend/admin` contains studio sign-in, dashboard actions, gallery management, and reusable forms/components.
- `frontend/shared` contains API request helpers and shared site content/date utilities.
- `frontend/main.jsx` is the small React entry point. `frontend/styles.css` supplies shared styles, with responsive refinements scoped in each experience folder.

To publish work, open the studio dashboard, upload client media, and check only the images or videos approved for public sharing. Showcase media becomes publicly accessible; unchecked media continues to require the client's gallery access code. Admins can add, replace, or remove media after sharing a gallery. Replacing media makes the new file private until it is selected for public display. A new access code can be issued at any time; doing so revokes the previous code and existing client gallery sessions.

For an existing installation, run `scripts/migrate-private-access.sql` once after `scripts/migrate-showcase.sql`.
