# Crypto Desk — Bitcoin Investment Tracker

A static, local-first cryptocurrency dashboard built with HTML5, CSS3 and vanilla JavaScript. It runs directly on GitHub Pages: no build step, backend, API key, login, Supabase, Firebase or paid service.

## Features

- Binance public REST market snapshot for USDT spot pairs, plus WebSocket ticker updates for BTC, ETH, BNB, SOL, XRP, ADA, DOGE and LTC.
- Search, sort, watchlist and coin detail charts for listed USDT pairs.
- TradingView BTC/USDT chart and individual pair charts.
- Custom Crypto Desk logo used as the site favicon, Apple touch icon and sidebar brand mark.
- IndexedDB transaction ledger, BTC accumulation goals and investment journal.
- FIFO realized/unrealized PNL calculations with BTC quantities converted to integer satoshis and cash values rounded to cents.
- Transaction revisions and edit snapshots; transaction IDs and original creation timestamps are preserved when editing.
- JSON export/restore with schema validation and CSV transaction export.
- Responsive dark UI; local ledger remains usable if market data is offline.

## Run locally

For ES modules and IndexedDB, use a local static web server (do not open `index.html` as a `file://` URL).

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `crypto-desk`.
2. Upload the contents of this ZIP to the repository root. `index.html`, `styles.css`, `app.js`, `js/`, `.nojekyll` and `README.md` should be at the root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for GitHub Pages to publish and open the provided `https://<username>.github.io/<repository>/` URL.

No build process or environment variables are required.

## Add a BTC transaction

1. Open **Transactions → Add transaction**.
2. Choose **Buy BTC** or **Sell BTC**.
3. Enter the transaction date/time, BTC quantity, price per BTC (USDT), fee (USDT), and optional exchange, reference and notes.
4. Save. The app validates the sale against available BTC and blocks an oversell.
5. Edit or delete a record from the transaction table. Edits increment the revision and retain a snapshot of the prior version in the transaction's history.

Accounting conventions:
- Buy lot cost = quantity × buy price + fee.
- Sell proceeds = quantity × sell price − fee.
- Sold BTC consumes oldest purchase lots first (FIFO); the sell fee reduces proceeds.
- Remaining cost basis is the cost of unsold lots.
- Unrealized PNL = live BTC value − remaining FIFO cost basis.
- Realized PNL = net sell proceeds − FIFO cost basis relieved.
- BTC quantity is calculated at satoshi precision; cash is rounded to cents for ledger reporting.
- Transactions are replayed chronologically; same-time entries use creation timestamp as a tie-breaker.

**Important:** fees are assumed to be denominated in USDT. If an exchange charged a fee in BNB, BTC, or another asset, convert and enter the fee's USDT equivalent yourself. For a BTC-denominated fee, reduce the BTC quantity appropriately before recording if that fee was deducted from the received/sold BTC.

## Export and restore

### JSON backup
Go to **Backup & Data → Download complete backup**. The JSON contains all IndexedDB collections (transactions, goals, journal, settings and audit), the schema version and export timestamp. Store the downloaded file in a safe location outside the browser/device.

### Restore
Choose your JSON file under **Restore backup**. The app checks the app marker, schema version, collection types, record IDs and transaction fields. After confirmation, it replaces the local database. Export your current records first if you may need them.

### CSV
Use **Export CSV** in Transactions or Backup & Data. The file can be opened in Excel or spreadsheet software.

## Data safety and privacy

- Investment data is stored in IndexedDB in the current browser profile on the current device.
- No cloud sync or server copy is created by this project.
- Clearing browser/site data, uninstalling the browser, device failure or device loss can destroy local records.
- Export JSON backups regularly and keep multiple copies in secure locations. A browser-local database is not a substitute for a durable backup.
- Market data is fetched from Binance public endpoints; charts are embedded from TradingView. Their availability and terms are outside this app's control.
- LocalStorage is used only for the watchlist and the last-backup display timestamp.

## Market/API notes

Binance public endpoints may be unavailable in some regions/networks, may change, or may impose rate limits. The app fetches the 24-hour ticker snapshot once at startup and uses a combined WebSocket stream for selected high-liquidity symbols. It does not poll the full market repeatedly. If the market API fails, local investment records can still be opened and managed. Binance USDT spot listings are subject to exchange availability and regional restrictions.

## Limitations / accounting assumptions

- Portfolio valuation uses the current BTC/USDT quote, not a historical valuation curve. The analytics page intentionally displays recorded transaction history and accumulation; it does not fabricate historical portfolio values.
- Monthly investment chart is based on recorded buy transactions only.
- "Total ROI" is total realized plus current unrealized PNL divided by net contributed cash (buy costs less net sell proceeds); this is an informative display convention, not a tax report.
- FIFO is an accounting aid, not tax advice. Confirm jurisdiction-specific cost basis, fee treatment and reporting rules with a qualified professional.
- Optional attachment/receipt references can be entered in notes/reference fields; files themselves are not uploaded or persisted by this static implementation.

## Project structure

```text
crypto-dashboard/
├── index.html
├── styles.css
├── app.js
├── js/
│   ├── database.js
│   ├── binance-api.js
│   ├── market.js
│   ├── portfolio.js
│   ├── transactions.js
│   ├── pnl-calculator.js
│   ├── analytics.js
│   ├── backup.js
│   ├── journal.js
│   └── utils.js
├── assets/
│   └── crypto-desk-logo.png
├── README.md
└── .nojekyll
```


## Developer tests

The FIFO accounting tests use Node's built-in test runner (Node 18+):

```bash
node --experimental-default-type=module --test tests/pnl.test.mjs
```

The suite covers multiple purchase lots, partial FIFO sales, fees and oversell rejection. Browser-specific IndexedDB persistence and restore behavior should additionally be verified in a real browser before relying on this for long-term records.
