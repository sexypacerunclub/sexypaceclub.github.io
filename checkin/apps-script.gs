/**
 * Sexy Pace Check-In — Apps Script Web App backend.
 *
 * This is the authoritative (server-side) time gate. The check on the
 * HTML page (checkin/index.html) is just for a fast, friendly message —
 * THIS is the copy that can't be bypassed by changing a device's clock.
 *
 * Fields match the original Google Form ("Sexy Pace Run Club Check-In
 * 2026") exactly: Email (required), Name (optional), first-time radio
 * (required), email-consent checkbox (required — this is the opt-in
 * basis for adding someone to the Brevo list; keep logging it as its
 * own column so there's a record of consent per person).
 *
 * SETUP (one time):
 *   1. Create a new Google Sheet — e.g. "Sexy Pace Check-Ins".
 *      Row 1 headers get added automatically on first submission.
 *   2. In that Sheet: Extensions -> Apps Script.
 *   3. Delete the placeholder code, paste this whole file, save.
 *   4. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *      Deploy, authorize when prompted (first run only).
 *   5. Copy the deployed Web App URL, paste it into checkin/index.html
 *      as the value of window.SCRIPT_URL, then commit/push/merge that.
 *
 * If the check-in windows ever change, edit isInWindow() here AND the
 * matching isInWindow() in checkin/index.html — keep them in sync.
 */

function doPost(e) {
  var output;
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').toString().trim();
    var name = (data.name || '').toString().trim();
    var firstTime = (data.firstTime || '').toString().trim();
    var consent = data.consent === true;

    if (!email || !firstTime || !consent) {
      output = { status: 'error', message: 'Email, the first-time question, and consent are all required.' };
    } else if (!isInWindow(new Date())) {
      output = { status: 'closed' };
    } else {
      appendCheckIn(email, name, firstTime, consent);
      output = { status: 'ok' };
    }
  } catch (err) {
    output = { status: 'error', message: 'Server error — try again.' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function isInWindow(date) {
  var tz = 'America/Chicago'; // Houston — handles CST/CDT automatically
  var day = Utilities.formatDate(date, tz, 'EEEE');
  var hour = parseInt(Utilities.formatDate(date, tz, 'H'), 10);
  var minute = parseInt(Utilities.formatDate(date, tz, 'm'), 10);
  var t = hour + minute / 60;

  if (day === 'Wednesday' && t >= 17 && t < 22) return true;
  if (day === 'Saturday' && t >= 4 && t < 12) return true;
  return false;
}

// Keep this in sync with the checkbox label in checkin/index.html —
// this exact string gets logged per signup as the consent record.
var CONSENT_TEXT = 'I agree to receive occasional emails from Sexy Pace about events, milestones, notifications & updates — and may be entered into occasional giveaways. No purchase necessary.';

function appendCheckIn(email, name, firstTime, consent) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getRange(1, 1).getValue() === '') {
    sheet.getRange(1, 1, 1, 6).setValues([
      ['Timestamp', 'Email', 'Name', 'First Time?', 'Email Consent', 'Consent Text Shown']
    ]);
  }

  // Standard practice for email-marketing consent records: log WHEN
  // consent was given (timestamp, below) and WHAT exact wording they
  // agreed to (so a later change to the checkbox copy doesn't retroactively
  // change what older signups are considered to have agreed to).
  // Note: Apps Script Web Apps don't expose the requester's IP address,
  // so that's not captured here — timestamp + exact wording is what's
  // available on this stack.
  var tz = 'America/Chicago';
  var timestamp = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([timestamp, email, name, firstTime, consent ? 'Yes' : 'No', consent ? CONSENT_TEXT : '']);
}
