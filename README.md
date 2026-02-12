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
