/**
 * Nero DC — Private Events lead capture
 * ---------------------------------------------------------------
 * Receives a POST from privateevents.nerowashdc.com, appends a row
 * to the bound Google Sheet, and emails the events team immediately.
 *
 * Setup: see LEAD-CAPTURE-SETUP.md. Short version —
 *   1. Create a Google Sheet, Extensions → Apps Script, paste this in
 *   2. Edit the CONFIG block below
 *   3. Deploy → New deployment → Web app
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   4. Copy the /exec URL into index.html (ENDPOINT)
 *
 * Re-deploy as a NEW VERSION after any edit, or the live URL keeps
 * running the old code. This is the single most common mistake.
 */

// ═══════════════════ CONFIG ═══════════════════

var CONFIG = {
  // Who gets the instant email. Comma-separate for several people.
  NOTIFY: 'events@nerowashdc.com',

  // Optional. Leave '' to skip. Sends a copy to a Slack channel.
  SLACK_WEBHOOK: '',

  // Tab name inside the spreadsheet. Created automatically.
  SHEET_NAME: 'Leads',

  // Reject anything not sent from these origins. '' disables the check.
  ALLOWED_HOST: 'privateevents.nerowashdc.com'
};

// Column order. Add fields to the end — never reorder, or historical
// rows stop lining up with their headers.
var COLUMNS = [
  'submitted_at', 'first_name', 'last_name', 'email', 'phone',
  'event_date', 'guest_count', 'event_type', 'audience',
  'company', 'alt_date', 'start_time', 'end_time', 'space',
  'food_style', 'food_package', 'salad', 'dessert', 'dietary',
  'bev_style', 'bev_package', 'bev_hours', 'toast',
  'setup', 'setup_notes',
  'budget', 'priorities', 'notes',
  'estimate_shown', 'fill_seconds',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'referrer', 'page'
];

// ═══════════════════ HANDLERS ═══════════════════

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Serialize writes so two simultaneous submits can't claim the same row.
    lock.waitLock(20000);

    var data = JSON.parse(e.postData.contents);

    // Honeypot — a filled hidden field means a bot. Accept and discard,
    // so the bot sees success and doesn't retry.
    if (data.company_url) return json({ ok: true });

    // Weak spam signal: a human does not complete this form in five seconds.
    // We still record it — flagging beats discarding, because the cost of a
    // dropped real lead is far higher than the cost of one junk row.
    if (data.fill_seconds && Number(data.fill_seconds) < 5) {
      data.notes = (data.notes || '') + ' [flag: submitted in ' + data.fill_seconds + 's]';
    }

    if (CONFIG.ALLOWED_HOST && data.page && data.page.indexOf(CONFIG.ALLOWED_HOST) === -1) {
      // Not fatal — local testing and preview deploys hit this. Tag it.
      data.notes = (data.notes || '') + ' [off-host submit: ' + data.page + ']';
    }

    var sheet = getSheet();
    sheet.appendRow(COLUMNS.map(function (c) { return data[c] || ''; }));

    notify(data);
    if (CONFIG.SLACK_WEBHOOK) postSlack(data);

    return json({ ok: true });
  } catch (err) {
    // Last resort: if the sheet write failed, still get the lead to a human.
    try {
      MailApp.sendEmail(CONFIG.NOTIFY,
        'NERO LEAD — sheet write failed, details inside',
        'The website form submitted but the spreadsheet write failed.\n\n' +
        'Error: ' + err + '\n\nRaw submission:\n' + (e && e.postData ? e.postData.contents : '(none)'));
    } catch (e2) {}
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e3) {}
  }
}

function doGet() {
  return json({ ok: true, service: 'nero-private-events-lead-capture' });
}

// ═══════════════════ HELPERS ═══════════════════

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify(d) {
  var name = ((d.first_name || '') + ' ' + (d.last_name || '')).trim() || 'Someone';
  var subject = 'Private event inquiry — ' + name
    + (d.guest_count ? ', ' + d.guest_count + ' guests' : '')
    + (d.event_date ? ', ' + d.event_date : '');

  var lines = [];
  function add(label, value) { if (value) lines.push(label + ': ' + value); }

  add('Name', name);
  add('Email', d.email);
  add('Phone', d.phone);
  add('Company', d.company);
  lines.push('');
  add('Date', d.event_date);
  add('Alternate date', d.alt_date);
  add('Time', [d.start_time, d.end_time].filter(String).join(' – '));
  add('Guests', d.guest_count);
  add('Type', d.event_type);
  add('Corporate or social', d.audience);
  add('Preferred space', d.space || 'Not sure — wants a recommendation');
  lines.push('');
  add('Food', d.food_style);
  add('Package', d.food_package);
  add('Salad', d.salad);
  add('Dessert', d.dessert);
  add('Dietary', d.dietary);
  lines.push('');
  add('Beverage', d.bev_style);
  add('Bar package', d.bev_package);
  add('Bar duration', d.bev_hours);
  add('Sparkling toast', d.toast);
  lines.push('');
  add('Setup', d.setup);
  add('Setup notes', d.setup_notes);
  lines.push('');
  add('Budget', d.budget);
  add('Priorities', d.priorities);
  add('Notes', d.notes);
  add('Estimate they saw on the site', d.estimate_shown);
  lines.push('');
  add('Source', d.utm_source || d.referrer);
  add('Campaign', d.utm_campaign);

  var body = lines.join('\n').replace(/\n{3,}/g, '\n\n')
    + '\n\n— Sent automatically from privateevents.nerowashdc.com';

  MailApp.sendEmail({
    to: CONFIG.NOTIFY,
    replyTo: d.email || undefined,
    subject: subject,
    body: body
  });
}

function postSlack(d) {
  var text = '*New private event inquiry*\n'
    + '*' + ((d.first_name || '') + ' ' + (d.last_name || '')).trim() + '*'
    + (d.company ? ' — ' + d.company : '') + '\n'
    + (d.guest_count || '?') + ' guests · ' + (d.event_date || 'date TBD')
    + ' · ' + (d.event_type || 'type TBD') + '\n'
    + (d.space ? 'Space: ' + d.space + '\n' : '')
    + (d.budget ? 'Budget: ' + d.budget + '\n' : '')
    + (d.estimate_shown ? 'Estimator showed them: ' + d.estimate_shown + '\n' : '')
    + 'Source: ' + (d.utm_source || d.referrer || 'direct')
    + (d.utm_campaign ? ' / ' + d.utm_campaign : '') + '\n'
    + (d.email || '') + ' · ' + (d.phone || '');

  UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text }),
    muteHttpExceptions: true
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the editor to confirm the sheet, email and (if set)
 * Slack all work before pointing the live form at this deployment.
 */
function testSubmission() {
  doPost({
    postData: {
      contents: JSON.stringify({
        first_name: 'Test', last_name: 'Booker',
        email: 'test@example.com', phone: '202-555-0100',
        event_date: '2026-12-11', guest_count: '45',
        event_type: 'Holiday party', audience: 'Corporate',
        company: 'Test Co', space: 'The Wine Bar (~60 standing)',
        food_package: "Nero's Cena — $75 pp",
        bev_style: 'Host tab', budget: '$5,000 – $10,000',
        estimate_shown: '$4,489',
        utm_source: 'meta', utm_campaign: 'holiday-2026',
        page: 'https://privateevents.nerowashdc.com/'
      })
    }
  });
}
