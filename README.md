# EV Mate - Electric Vehicle Fleet Tracker

EV Mate is a **Progressive Web App (PWA)** designed to help Electric Vehicle owners track their fleet's performance, charging efficiency, and Total Cost of Ownership (TCO).

Optimized for mobile use, it runs entirely in the browser using **LocalStorage** for data persistence, ensuring functionality even without an internet connection.

## Features

-   **Garage Management**: Add and manage multiple EVs.
-   **Trip Logging**: Track distance, efficiency (km/kWh), and SoC usage.
-   **Charging Log**: Record Home and Public charging sessions.
    -   *Home*: Auto-calculates cost based on tariff and charger efficiency.
    -   *Public*: Log exact units (kWh) and amount paid.
-   **Maintenance & Expenses**: Track service, repairs, tyres, and insurance.
-   **Advanced Analytics Dashboard**:
    -   Weekly / Monthly / Yearly / All-time stats.
    -   Metrics: Total Distance, Efficiency, Running Cost (₹/km), TCO/km.
-   **Mobile-First Design**: Fixed bottom navigation and responsive layout.

## Tech Stack

-   **Frontend**: React (Vite)
-   **Styling**: Vanilla CSS (Variables, Flexbox/Grid)
-   **State Management**: React Context API
-   **Routing**: React Router DOM
-   **Storage**: Browser LocalStorage (No backend required)

## Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ev-mate.git
    cd ev-mate
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run locally**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## Deployment

### Google sign-in setup

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview), select or create a project, and configure Branding and Audience for **EV Mate**. If the app is in Testing, add your Google account as a test user.
2. Under **Clients**, create an OAuth client with application type **Web application**.
3. Add these **Authorized JavaScript origins** (origins have no path):
   - `https://myby1983.github.io`
   - `http://localhost`
   - `http://localhost:5173`
   - `http://localhost:4173` if using Vite preview.
4. Copy the public client ID ending in `.apps.googleusercontent.com`. No client secret is used by this browser app. Popup sign-in does not require a redirect URI.
5. For local development, copy `.env.example` to `.env.local` and replace the placeholder client ID. Restart Vite after changing it.
6. For GitHub Pages, the deployment workflow defaults to the configured EV Tracker public client ID. To override it, open the repository's **Settings → Secrets and variables → Actions → Variables**, and create a repository variable named `VITE_GOOGLE_CLIENT_ID` with another client ID. Run the workflow again after changing it.

Google Identity Services renders the sign-in button. The app verifies the returned ID token's signature using Google's public keys, plus its audience, issuer, expiry, and a per-login nonce. The Google subject ID identifies each account's local garage. Only the profile is saved; Google credentials are not stored.

Existing mock sessions are no longer accepted. On the login page, users with old test-account vehicles can choose **Bring my existing logs into this Google account** and download a backup before signing in. This links the legacy garage to one Google account on that browser, retains the original records, and leaves all vehicle logs intact. Without selecting it, the account starts with its own garage.

This static app has no server session or cloud sync. Browser storage is not a security boundary; any future backend must independently verify Google credentials and enforce account permissions on the server.

Validation: `npm run test:auth` checks signed-token verification and local session handling. Full popup sign-in must also be checked with a configured client ID on an authorized origin.

### Moving existing phone records to Google sign-in

Use the same phone, browser/profile, and site URL where the records were entered. Do not clear site data, uninstall the installed web app, or use private browsing during migration.

1. Open `https://myby1983.github.io/ag_evTrack/` on the phone. Refresh to load the update. The old test login will be replaced by the Google login page; your stored records remain.
2. On that page, select **Back up existing logs**. Check that the JSON file is saved in Downloads/Files and keep another copy somewhere safe.
3. Tick **Bring my existing logs into this Google account** before pressing the Google sign-in button. Choose the Google account you intend to keep using.
4. Check the correct vehicle and review History's Trips, Charging, and Maintenance tabs. Confirm a few old and recent entries and compare dashboard totals with your previous figures.
5. In Garage, export another backup after confirming everything is present. Keep both the before and after backups.

If you signed in without ticking the migration box and see **Add New Vehicle**, do not recreate the car or re-enter logs. Press **Sign out / Return to sign-in** below the form, tick the migration option on the login page, and sign in again.

If the migration option is absent, first confirm the same browser/profile and URL. Avoid importing or clearing anything until locating the original data. Import replaces all app records. Signing into the same Google account on a different device does not transfer records; backups are still required for manual device transfers.

To build the project for production (e.g., GitHub Pages, Vercel, Netlify):

1.  **Build**:
    ```bash
    npm run build
    ```
    This creates a `dist` folder with the static assets.

2.  **Preview**:
    ```bash
    npm run preview
    ```

## Data Management

**Note**: All data is stored in your browser's **Local Storage**. 
-   Clearing your browser cache/data will remove your logs.
-   Data is not synced across devices (unless you manually export/import - feature coming soon).

## License

MIT
