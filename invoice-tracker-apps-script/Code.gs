/**
 * Portfolio Sample: Google Sheets Invoice Tracker Automation
 * Sheet name: "Invoice Tracker"
 * Columns: A=Invoice No | B=Client | C=Amount | D=Due Date | E=Status | F=Client Email
 */

const SHEET_NAME = "Invoice Tracker";

/**
 * Adds the custom "Invoice Tools" menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Invoice Tools")
    .addItem("Highlight Overdue Unpaid Rows", "highlightOverdueInvoices")
    .addItem("Email Me Unpaid & Overdue Summary", "emailUnpaidSummary")
    .addSeparator()
    .addItem("Setup Daily 8 AM Trigger", "setupDaily8amTrigger")
    .addToUi();
}

/**
 * Helper: fetch the Invoice Tracker sheet or explain what is wrong.
 */
function getInvoiceSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found. Please rename your tab to "' + SHEET_NAME + '".');
  }
  return sheet;
}

/**
 * (a) Highlights overdue and unpaid rows in light red (#fce8e6) and resets the others.
 */
function highlightOverdueInvoices() {
  const sheet = getInvoiceSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const range = sheet.getRange(2, 1, lastRow - 1, 6);
  const values = range.getValues();
  const backgrounds = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < values.length; i++) {
    const dueDate = new Date(values[i][3]);
    const status = String(values[i][4]).trim().toLowerCase();
    const isOverdue = !isNaN(dueDate.getTime()) && dueDate < today && status !== "paid";
    const rowColor = isOverdue ? "#fce8e6" : "#ffffff";
    backgrounds.push(new Array(6).fill(rowColor));
  }

  range.setBackgrounds(backgrounds);
}

/**
 * (b) Emails the sheet owner a summary of all unpaid and overdue invoices.
 */
function emailUnpaidSummary() {
  const sheet = getInvoiceSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const unpaidList = [];
  let totalUnpaid = 0;

  for (let i = 0; i < values.length; i++) {
    const [invNo, client, amount, dueRaw, statusRaw, clientEmail] = values[i];
    const status = String(statusRaw).trim().toLowerCase();
    if (!invNo || status === "paid") continue;

    const dueDate = new Date(dueRaw);
    const isOverdue = !isNaN(dueDate.getTime()) && dueDate < today;
    const dueStr = !isNaN(dueDate.getTime())
      ? Utilities.formatDate(dueDate, Session.getScriptTimeZone(), "yyyy-MM-dd")
      : "N/A";
    const numAmount = parseFloat(amount) || 0;
    totalUnpaid += numAmount;

    unpaidList.push(
      "- " + invNo + " | " + client + " (" + clientEmail + ") | S$" + numAmount.toFixed(2) +
      " | Due: " + dueStr + (isOverdue ? " [OVERDUE]" : " [UNPAID]")
    );
  }

  // getEffectiveUser works inside time-driven triggers; getActiveUser can be empty there.
  const recipient = Session.getEffectiveUser().getEmail();
  if (!recipient) return;

  const subject = "Invoice Tracker Summary: " + unpaidList.length + " open invoices (S$" + totalUnpaid.toFixed(2) + ")";
  const body = unpaidList.length
    ? "Here is your current summary of unpaid and overdue invoices:\n\n" + unpaidList.join("\n") +
      "\n\nTotal outstanding: S$" + totalUnpaid.toFixed(2)
    : "Good news! All invoices in Invoice Tracker are marked as Paid.";

  MailApp.sendEmail(recipient, subject, body);
}

/**
 * (c) Creates one daily trigger around 8:00 AM, replacing any earlier copy.
 */
function setupDaily8amTrigger() {
  const existing = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === "runDailyInvoiceCheck") {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  ScriptApp.newTrigger("runDailyInvoiceCheck").timeBased().everyDays(1).atHour(8).create();
}

function runDailyInvoiceCheck() {
  highlightOverdueInvoices();
  emailUnpaidSummary();
}
