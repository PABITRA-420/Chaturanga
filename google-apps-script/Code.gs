/**
 * CHATURANGA.JGEC - Free-Tier Google Sheets Automation Script
 * 
 * FEATURES:
 * 1. Automatically records every tournament registration into 'Registrations' sheet.
 * 2. Automatically creates and updates live charts in 'Analytics & Charts' sheet:
 *    - Chart 1: Department Distribution (Bar Chart)
 *    - Chart 2: Rating Category Distribution (Pie / Donut Chart)
 *    - Chart 3: Tournament Participation Breakdown (Column Chart)
 * 3. 100% Free - Runs on Google's free infrastructure, no credit card or paid API required.
 * 
 * HOW TO DEPLOY (Takes 2 minutes):
 * 1. Open Google Sheets (https://sheets.new) and name it "Chaturanga JGEC Registrations".
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any code in the editor and paste this entire file.
 * 4. Click "Deploy" (top right) > "New deployment".
 * 5. Select type: "Web app" (click gear icon next to 'Select type').
 * 6. Set Description: "Chaturanga Registration API"
 * 7. Set "Execute as": "Me" (your Google account)
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for free tier public web forms!
 * 9. Click "Deploy", authorize Google account access, and copy the "Web app URL".
 * 10. Paste the URL into your project's .env.local as:
 *     GOOGLE_SHEET_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 */

// =========================================================================
// SPREADSHEET LINKAGE:
// Explicit Sheet ID ensures the Web App always opens this exact spreadsheet
var SPREADSHEET_ID_OR_URL = "1bfFYC3jwdndjTfT5nMJ0nANOrVFKngNUzEP-IFu-Olg";
// =========================================================================

function getSpreadsheet() {
  if (SPREADSHEET_ID_OR_URL && SPREADSHEET_ID_OR_URL.trim() !== "") {
    var raw = SPREADSHEET_ID_OR_URL.trim();
    if (raw.indexOf("/d/") !== -1) {
      var id = raw.split("/d/")[1].split("/")[0];
      return SpreadsheetApp.openById(id);
    }
    return SpreadsheetApp.openById(raw);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    // Wait up to 10 seconds for concurrent requests
    lock.waitLock(10000);

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var ss = getSpreadsheet();
    if (!ss) {
      throw new Error("Spreadsheet not found! Please open your Google Sheet, copy its browser URL, and paste it into SPREADSHEET_ID_OR_URL at line 10 of Code.gs.");
    }
    
    // 1. Get or create Master "All Registrations" sheet
    var masterSheet = ss.getSheetByName("All Registrations");
    if (!masterSheet) {
      masterSheet = ss.insertSheet("All Registrations", 0);
      setupRegistrationsHeader(masterSheet);
    }

    // Prepare row values
    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone() || "GMT+5:30", "yyyy-MM-dd HH:mm:ss");

    var row = [
      formattedDate,
      data.ticketId || data.uniqueCode || "",
      data.tournament || "",
      data.fullName || "",
      data.rollNumber || "",
      data.department || "",
      data.year || "",
      data.institution || "",
      data.email || "",
      data.phone || "",
      data.ratingCategory || "",
      data.chessUsername || "",
      data.fideId || ""
    ];

    // Append to master database
    masterSheet.appendRow(row);
    applyBeautifulSpacing(masterSheet);

    // 2. AUTOMATIC DEDICATED TAB PER TOURNAMENT
    // Sanitizes and truncates to 30 chars (max Google Sheet tab length is 100, 30 is clean)
    var tourneyName = (data.tournament || "General Tournament").trim();
    var tabName = tourneyName.replace(/[\\/?*[\]:]/g, "").substring(0, 30);
    
    var tourneySheet = ss.getSheetByName(tabName);
    if (!tourneySheet) {
      tourneySheet = ss.insertSheet(tabName);
      setupRegistrationsHeader(tourneySheet);
    }
    tourneySheet.appendRow(row);
    applyBeautifulSpacing(tourneySheet);

    // 3. Refresh / build Analytics charts based on the active tournament or master data
    updateAnalyticsAndCharts(ss, tourneySheet);

    lock.releaseLock();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration recorded successfully",
      ticketId: data.ticketId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// For quick browser verification: visiting the URL shows system status
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Chaturanga JGEC Registration WebApp is online and accepting POST requests."
  })).setMimeType(ContentService.MimeType.JSON);
}

// Generous, professional column spacing and row formatting
function applyBeautifulSpacing(sheet) {
  var colWidths = [
    165, // A: Timestamp
    160, // B: Pass ID
    250, // C: Tournament Name
    180, // D: Full Name
    140, // E: Roll Number
    200, // F: Department
    120, // G: Year of Study
    210, // H: Institution
    220, // I: Email
    150, // J: WhatsApp / Phone
    180, // K: Rating Category
    170, // L: Chess.com / Lichess
    120, // M: FIDE ID
    190, // N: Attendance (Present/Absent)
    85,  // O: R1 Score
    85,  // P: R2 Score
    85,  // Q: R3 Score
    85,  // R: R4 Score
    85,  // S: R5 Score
    110, // T: Total Points
    110, // U: Final Rank
    230  // V: Arbiter Notes
  ];

  for (var c = 0; c < colWidths.length; c++) {
    sheet.setColumnWidth(c + 1, colWidths[c]);
  }

  // Row height for header
  sheet.setRowHeight(1, 38);

  // Row height and formatting for player rows
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    for (var r = 2; r <= lastRow; r++) {
      sheet.setRowHeight(r, 28);
    }
    // Set vertical centering and clean font for all data cells
    var dataRange = sheet.getRange(2, 1, lastRow - 1, colWidths.length);
    dataRange.setVerticalAlignment("middle");
    dataRange.setFontFamily("Inter");
  }

  var headerRange = sheet.getRange(1, 1, 1, colWidths.length);
  headerRange.setVerticalAlignment("middle");
}

// RUN THIS FUNCTION DIRECTLY IN APPS SCRIPT TO INSTANTLY FIX ALL EXISTING TABS
function beautifyAllSheetsNow() {
  var ss = getSpreadsheet();
  if (!ss) return;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name !== "Analytics & Charts") {
      applyBeautifulSpacing(sheets[i]);
    }
  }
}

// Header styling for the Registrations sheet
function setupRegistrationsHeader(sheet) {
  var playerHeaders = [
    "Timestamp",
    "Pass ID",
    "Tournament Name",
    "Full Name",
    "Roll Number",
    "Department",
    "Year of Study",
    "Institution",
    "Email",
    "WhatsApp / Phone",
    "Rating Category",
    "Chess.com / Lichess",
    "FIDE ID"
  ];

  // Dedicated editable columns for Tournament Arbiter & Admin
  var adminHeaders = [
    "Attendance (Present/Absent)",
    "R1 Score",
    "R2 Score",
    "R3 Score",
    "R4 Score",
    "R5 Score",
    "Total Points",
    "Final Rank",
    "Arbiter Notes / Remarks"
  ];

  var allHeaders = playerHeaders.concat(adminHeaders);

  sheet.appendRow(allHeaders);

  // Player info header styling (Chaturanga Gold & Dark)
  var playerRange = sheet.getRange(1, 1, 1, playerHeaders.length);
  playerRange.setBackground("#0B0F14");
  playerRange.setFontColor("#D4AF7C");
  playerRange.setFontWeight("bold");
  playerRange.setFontFamily("Montserrat");
  playerRange.setHorizontalAlignment("center");

  // Admin editable columns styling (Distinct Slate/Blue for easy recognition)
  var adminRange = sheet.getRange(1, playerHeaders.length + 1, 1, adminHeaders.length);
  adminRange.setBackground("#1E293B");
  adminRange.setFontColor("#38BDF8");
  adminRange.setFontWeight("bold");
  adminRange.setFontFamily("Montserrat");
  adminRange.setHorizontalAlignment("center");

  sheet.setFrozenRows(1);
  applyBeautifulSpacing(sheet);
}

// Automatically builds / updates Analytics & Charts sheet with Pivot Summaries and Visual Charts
function updateAnalyticsAndCharts(ss, regSheet) {
  var analyticsSheet = ss.getSheetByName("Analytics & Charts");
  if (!analyticsSheet) {
    analyticsSheet = ss.insertSheet("Analytics & Charts", 1);
  }

  // Clear existing charts to refresh
  var existingCharts = analyticsSheet.getCharts();
  for (var i = 0; i < existingCharts.length; i++) {
    analyticsSheet.removeChart(existingCharts[i]);
  }

  // Clear data range
  analyticsSheet.clear();

  // Top Header Banner with Event Title and Last Updated Time
  var title = analyticsSheet.getRange("A1:H1");
  title.merge();
  var tourneyTitle = regSheet.getName();
  title.setValue("CHATURANGA.JGEC • " + tourneyTitle.toUpperCase() + " • LIVE CHARTS");
  title.setBackground("#0B0F14");
  title.setFontColor("#D4AF7C");
  title.setFontSize(14);
  title.setFontWeight("bold");
  title.setHorizontalAlignment("center");

  var subtitle = analyticsSheet.getRange("A2:H2");
  subtitle.merge();
  var syncTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "EEEE, d MMM yyyy • HH:mm:ss");
  var totalPlayers = Math.max(0, regSheet.getLastRow() - 1);
  subtitle.setValue("Live Total Registrations: " + totalPlayers + " Players  |  Last Synced: " + syncTime);
  subtitle.setBackground("#12161D");
  subtitle.setFontColor("#A0A6B0");
  subtitle.setFontSize(10);
  subtitle.setHorizontalAlignment("center");

  // Read data from Registrations
  var lastRow = regSheet.getLastRow();
  if (lastRow <= 1) return; // Only headers

  var dataRange = regSheet.getRange(2, 1, lastRow - 1, 13).getValues();

  var deptCounts = {};
  var ratingCounts = {};
  var tournamentCounts = {};

  for (var r = 0; r < dataRange.length; r++) {
    var tourney = dataRange[r][2] || "Unspecified";
    var dept = dataRange[r][5] || "Other";
    var rating = dataRange[r][10] || "Unrated";

    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    tournamentCounts[tourney] = (tournamentCounts[tourney] || 0) + 1;
  }

  // Write Department Summary Table in Column A & B (starting row 3)
  analyticsSheet.getRange("A3").setValue("Department");
  analyticsSheet.getRange("B3").setValue("Players");
  analyticsSheet.getRange("A3:B3").setFontWeight("bold").setBackground("#D4AF7C").setFontColor("#0B0F14");

  var deptRow = 4;
  for (var d in deptCounts) {
    analyticsSheet.getRange(deptRow, 1).setValue(d);
    analyticsSheet.getRange(deptRow, 2).setValue(deptCounts[d]);
    deptRow++;
  }

  // Write Rating Category Summary Table in Column D & E
  analyticsSheet.getRange("D3").setValue("Rating Tier");
  analyticsSheet.getRange("E3").setValue("Count");
  analyticsSheet.getRange("D3:E3").setFontWeight("bold").setBackground("#D4AF7C").setFontColor("#0B0F14");

  var ratingRow = 4;
  for (var rt in ratingCounts) {
    analyticsSheet.getRange(ratingRow, 4).setValue(rt);
    analyticsSheet.getRange(ratingRow, 5).setValue(ratingCounts[rt]);
    ratingRow++;
  }

  // Build Visual Chart 1: Department Bar Chart
  if (deptRow > 4) {
    var deptChartRange = analyticsSheet.getRange(3, 1, deptRow - 3, 2);
    var deptChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(deptChartRange)
      .setPosition(deptRow + 2, 1, 0, 0)
      .setOption('title', 'Registrations by Engineering Department')
      .setOption('colors', ['#D4AF7C'])
      .setOption('legend', { position: 'none' })
      .setOption('width', 520)
      .setOption('height', 320)
      .build();
    analyticsSheet.insertChart(deptChart);
  }

  // Build Visual Chart 2: Rating Tier Pie/Donut Chart
  if (ratingRow > 4) {
    var ratingChartRange = analyticsSheet.getRange(3, 4, ratingRow - 3, 2);
    var ratingChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(ratingChartRange)
      .setPosition(ratingRow + 2, 4, 0, 0)
      .setOption('title', 'Player Rating Tier Distribution')
      .setOption('pieHole', 0.4) // Donut style
      .setOption('colors', ['#D4AF7C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'])
      .setOption('width', 520)
      .setOption('height', 320)
      .build();
    analyticsSheet.insertChart(ratingChart);
  }
}
