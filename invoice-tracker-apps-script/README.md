# Google Sheets Invoice Tracker (Apps Script sample)

A small automation for a Google Sheet called `Invoice Tracker`. It adds an **Invoice Tools** menu with three actions:

1. **Highlight Overdue Unpaid Rows**: any unpaid invoice with a past due date turns light red; paid and upcoming rows reset to white.
2. **Email Me Unpaid & Overdue Summary**: emails the sheet owner a digest of open invoices and the total outstanding.
3. **Setup Daily 8 AM Trigger**: installs one daily trigger that runs both checks (it replaces an older copy instead of duplicating).

## Setup

1. Create a new Google Sheet and rename the first tab to `Invoice Tracker`.
2. Paste the sample rows below into `A1:F6`.
3. Open Extensions > Apps Script, replace the default code with `Code.gs`, and save.
4. Reload the sheet; the **Invoice Tools** menu appears. Run **Highlight Overdue Unpaid Rows** and authorise the script when asked.

## Sample rows (demo data only)

```csv
Invoice No,Client,Amount,Due Date,Status,Client Email
INV-1001,Merlion Logistics Demo,480.00,2026-11-01,Unpaid,accounts@merlion-demo.example.com
INV-1002,Orchid Design Studio,1250.00,2026-11-10,Unpaid,billing@orchid-demo.example.com
INV-1003,Kopi Corner Cafe,150.00,2026-11-15,Paid,hello@kopicorner-demo.example.com
INV-1004,Apex Precision Demo,890.00,2026-11-18,Unpaid,finance@apex-demo.example.com
INV-1005,Sunlight Tuition Sample,320.00,2026-12-05,Unpaid,admin@sunlight-demo.example.com
```

## About this sample

Written with AI-assisted tools and reviewed by me. All names and emails are made-up demo data.

Status: reviewed, but not yet run in a live Google Sheet. A screenshot will be added after testing.
