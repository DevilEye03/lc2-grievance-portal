// Automated WhatsApp Bot Verification Suite
const BASE_URL = "http://localhost:3000";

async function runWhatsAppTests() {
  console.log("=== STARTING WHATSAPP BOT VERIFICATION ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  const testPhone = "919988776655";

  try {
    // -------------------------------------------------------------
    // 1. Meta Webhook Verification (GET /api/whatsapp)
    // -------------------------------------------------------------
    console.log("--- 1. Testing Meta Webhook Verification (GET) ---");
    const verifyUrl = `${BASE_URL}/api/whatsapp?hub.mode=subscribe&hub.verify_token=lc2_grievance_bot_verify_token_2026&hub.challenge=test_challenge_12345`;
    const verifyRes = await fetch(verifyUrl);
    const verifyChallenge = await verifyRes.text();

    assert(verifyRes.status === 200, "Webhook verification returned HTTP 200");
    assert(verifyChallenge === "test_challenge_12345", "Webhook correctly echoed hub.challenge");

    // Test invalid token rejection
    const invalidVerifyRes = await fetch(`${BASE_URL}/api/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=123`);
    assert(invalidVerifyRes.status === 403, "Invalid webhook token correctly rejected with HTTP 403");

    // -------------------------------------------------------------
    // 2. Reset session before conversational test
    // -------------------------------------------------------------
    await fetch(`${BASE_URL}/api/whatsapp/simulate?phone=${testPhone}`, { method: "DELETE" });

    // -------------------------------------------------------------
    // 3. Conversational State Machine: Initial greeting & Main Menu
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Main Menu & FAQ ---");
    const menuRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "hi" }),
    });
    const menuData = await menuRes.json();
    assert(menuData.success && menuData.reply.includes("LAW CENTRE II"), "Greeting contains 'LAW CENTRE II'");
    assert(menuData.reply.includes("Submit Grievance"), "Menu has option 1: Submit Grievance");
    assert(menuData.session.step === "IDLE", "Session is in IDLE step");

    // Test FAQ request
    const faqRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "3" }),
    });
    const faqData = await faqRes.json();
    assert(faqData.success && faqData.reply.includes("Frequently Asked Questions"), "FAQs returned on option 3");

    // -------------------------------------------------------------
    // 4. Guided Complaint Submission Flow
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Step-by-Step Grievance Filing via Chat ---");

    // Step A: Select Option 1 (Submit)
    const step1Res = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "1" }),
    });
    const step1Data = await step1Res.json();
    assert(step1Data.session.step === "SUBMIT_NAME", "Advanced to SUBMIT_NAME step");
    assert(step1Data.reply.includes("Full Name"), "Prompt asks for Full Name");

    // Step B: Enter Student Name
    const step2Res = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "Devansh Singhal" }),
    });
    const step2Data = await step2Res.json();
    assert(step2Data.session.step === "SUBMIT_ROLL", "Advanced to SUBMIT_ROLL step");
    assert(step2Data.session.tempData.studentName === "Devansh Singhal", "Student name stored in session tempData");

    // Step C: Enter Roll Number
    const step3Res = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "22LC2099" }),
    });
    const step3Data = await step3Res.json();
    assert(step3Data.session.step === "SUBMIT_EMAIL", "Advanced to SUBMIT_EMAIL step");
    assert(step3Data.session.tempData.studentRoll === "22LC2099", "Roll number stored");

    // Step D: Invalid Email validation
    const invalidEmailRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "invalid-email" }),
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert(invalidEmailData.session.step === "SUBMIT_EMAIL", "Remains on SUBMIT_EMAIL on invalid format");

    // Step E: Valid Email
    const validEmailRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "devansh@student.du.ac.in" }),
    });
    const validEmailData = await validEmailRes.json();
    assert(validEmailData.session.step === "SUBMIT_CATEGORY", "Advanced to SUBMIT_CATEGORY step");
    assert(validEmailData.reply.includes("Category"), "Prompts with category list");

    // Step F: Pick Category (3: Examination & Marks)
    const catRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "3" }),
    });
    const catData = await catRes.json();
    assert(catData.session.step === "SUBMIT_SUBJECT", "Advanced to SUBMIT_SUBJECT step");
    assert(catData.session.tempData.category === "EXAMINATION", "Category EXAMINATION recorded");

    // Step G: Subject
    const subRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "Discrepancy in CS302 examination grade" }),
    });
    const subData = await subRes.json();
    assert(subData.session.step === "SUBMIT_DESCRIPTION", "Advanced to SUBMIT_DESCRIPTION step");

    // Step H: Description (min 30 chars)
    const descText = "I received my semester grade card today, and there appears to be a clerical error in the final lab viva marks compilation.";
    const descRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: descText }),
    });
    const descData = await descRes.json();
    assert(descData.session.step === "SUBMIT_ATTACHMENT", "Advanced to SUBMIT_ATTACHMENT step");

    // Step I: Skip attachment -> Triggers creation!
    const attachRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "skip" }),
    });
    const attachData = await attachRes.json();
    assert(attachData.success, "Grievance creation completed successfully");
    assert(attachData.session.step === "IDLE", "Session reset to IDLE after filing");
    assert(attachData.reply.includes("Grievance Successfully Registered"), "Confirmation message returned");

    // Extract ticket ID from reply
    const match = attachData.reply.match(/GRV-\d{4}-\d{4}/);
    assert(match !== null, `Ticket ID extracted from response (${match ? match[0] : "none"})`);
    const createdTicketId = match ? match[0] : null;

    // -------------------------------------------------------------
    // 5. Track Status via WhatsApp Bot
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Grievance Tracking via WhatsApp ---");

    // Request tracking
    const trackStartRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "2" }),
    });
    const trackStartData = await trackStartRes.json();
    assert(trackStartData.session.step === "TRACK_INPUT", "Session in TRACK_INPUT step");

    // Provide Ticket ID
    const trackLookupRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: createdTicketId }),
    });
    const trackLookupData = await trackLookupRes.json();
    assert(trackLookupData.success, "Tracking lookup succeeded");
    assert(trackLookupData.reply.includes(createdTicketId), "Response mentions ticket ID");
    assert(trackLookupData.reply.includes("Devansh Singhal"), "Response includes student name");
    assert(trackLookupData.reply.includes("Registered"), "Status is shown as Registered");
    assert(trackLookupData.reply.includes("Resolution Pending"), "Notes pending status before resolution");

    // -------------------------------------------------------------
    // 6. Admin Resolves Complaint & Automated WhatsApp Alert Triggers
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Admin Resolution with WhatsApp Alert ---");

    // Login as Admin
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@college.edu", password: "Admin@123" }),
    });
    const cookieHeader = loginRes.headers.get("set-cookie").split(";")[0];

    // Find the complaint in DB to get its ID
    const listRes = await fetch(`${BASE_URL}/api/complaints?q=${createdTicketId}`, {
      headers: { Cookie: cookieHeader },
    });
    const listData = await listRes.json();
    const dbComplaint = listData.data.complaints[0];
    assert(dbComplaint && dbComplaint.ticketId === createdTicketId, "Complaint found in Admin API");
    assert(dbComplaint.source === "WHATSAPP", "Complaint source recorded as WHATSAPP");

    // Post official resolution
    const officialReplyText =
      "Dear Devansh, the examination branch rechecked the lab viva evaluation sheet. The entry has been corrected to grade A. Updated marks sheet will be issued tomorrow.";

    const replyRes = await fetch(`${BASE_URL}/api/complaints/${dbComplaint.id}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        authorityReply: officialReplyText,
        status: "RESOLVED",
      }),
    });
    const replyData = await replyRes.json();
    assert(replyRes.ok && replyData.success, "Admin posted official resolution");

    // Verify WhatsApp tracking now shows Resolved & the official reply!
    const trackAgainRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: "2" }),
    });
    const finalLookupRes = await fetch(`${BASE_URL}/api/whatsapp/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, text: createdTicketId }),
    });
    const finalLookupData = await finalLookupRes.json();
    assert(finalLookupData.reply.includes("Resolved"), "WhatsApp tracking confirms status is now Resolved");
    assert(finalLookupData.reply.includes(officialReplyText), "WhatsApp tracking includes official authority response");

    console.log("\n=======================================================");
    console.log(`WHATSAPP BOT VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================\n");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runWhatsAppTests();
