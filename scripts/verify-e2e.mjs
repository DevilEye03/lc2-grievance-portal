// E2E Verification Script
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING FULL E2E VERIFICATION ===\n");
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

  try {
    // -------------------------------------------------------------
    // Step 1: Submit a new complaint on /submit (/api/complaints)
    // -------------------------------------------------------------
    console.log("--- 1. Testing Complaint Submission ---");
    const newComplaint = {
      studentName: "Siddharth Rao",
      studentRoll: "CS2023099",
      studentEmail: "siddharth@student.edu",
      studentPhone: "9876543210",
      category: "ACADEMIC",
      subject: "Request for lab attendance recalculation",
      description: "I attended all scheduled laboratory sessions for CS302 Database Systems. However, the portal marks my attendance as 65% instead of 95%. Please verify the physical lab sign-in register.",
    };

    const submitRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComplaint),
    });

    const submitData = await submitRes.json();
    assert(submitRes.ok && submitData.success, "Complaint successfully registered");
    const ticketId = submitData.data?.ticketId;
    const complaintId = submitData.data?.id;
    console.log(`   Generated Ticket ID: ${ticketId}`);
    assert(/^GRV-\d{4}-\d{4}$/.test(ticketId), `Ticket ID matches format GRV-YYYY-XXXX (${ticketId})`);

    // -------------------------------------------------------------
    // Step 2: Track Status via Public Portal (/api/track)
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Public Tracking ---");
    const trackUrl = `${BASE_URL}/api/track?ticketId=${encodeURIComponent(ticketId)}&email=${encodeURIComponent(newComplaint.studentEmail)}`;
    const trackRes = await fetch(trackUrl);
    const trackData = await trackRes.json();

    assert(trackRes.ok && trackData.success, "Public tracking verified matching complaint");
    assert(trackData.data.ticketId === ticketId, "Ticket ID matches");
    assert(trackData.data.status === "REGISTERED", "Status is REGISTERED");
    assert(trackData.data.studentName === newComplaint.studentName, "Student name matches");
    assert(trackData.data.authorityReply === null, "Authority reply is initially null");
    assert(trackData.data.statusLogs && trackData.data.statusLogs.length >= 1, "Status log timeline entry present");

    // -------------------------------------------------------------
    // Step 3: Admin Login (/api/auth/login)
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Admin Login ---");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@college.edu",
        password: "Admin@123",
      }),
    });

    const loginData = await loginRes.json();
    assert(loginRes.ok && loginData.success, "Admin login successful");
    assert(loginData.data.role === "SUPER_ADMIN", "Admin role is SUPER_ADMIN");

    const setCookie = loginRes.headers.get("set-cookie");
    assert(setCookie && setCookie.includes("auth_token="), "HTTP-only auth_token cookie received");

    // Extract cookie value for subsequent admin requests
    const cookieHeader = setCookie.split(";")[0];

    // -------------------------------------------------------------
    // Step 4: Mandatory Resolution Validation
    // Attempting to resolve without authority reply MUST fail
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Mandatory Resolution Validation ---");
    const invalidResolveRes = await fetch(`${BASE_URL}/api/complaints/${complaintId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        status: "RESOLVED",
      }),
    });

    const invalidResolveData = await invalidResolveRes.json();
    assert(
      invalidResolveRes.status === 422 || invalidResolveData.success === false,
      "Resolving without authority reply correctly rejected with validation error"
    );
    console.log(`   Validation rejection message: "${invalidResolveData.error}"`);

    // Testing reply endpoint with short reply (< 20 chars) MUST fail
    const shortReplyRes = await fetch(`${BASE_URL}/api/complaints/${complaintId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        authorityReply: "Too short",
        status: "RESOLVED",
      }),
    });
    const shortReplyData = await shortReplyRes.json();
    assert(
      shortReplyRes.status === 400 || shortReplyData.success === false,
      "Reply with under 20 characters rejected"
    );

    // -------------------------------------------------------------
    // Step 5: Post Official Resolution Reply and Mark RESOLVED
    // -------------------------------------------------------------
    console.log("\n--- 5. Posting Official Resolution Reply ---");
    const officialReplyText =
      "Dear Siddharth Rao, the physical lab attendance register for CS302 Database Systems has been thoroughly cross-verified by the department coordinator. Your attendance has been corrected to 95% on the portal. This matter is now resolved.";

    const validReplyRes = await fetch(`${BASE_URL}/api/complaints/${complaintId}/reply`, {
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

    const validReplyData = await validReplyRes.json();
    assert(validReplyRes.ok && validReplyData.success, "Official reply posted and status updated to RESOLVED");

    // -------------------------------------------------------------
    // Step 6: Verify Student Public Tracking shows Official Resolution
    // -------------------------------------------------------------
    console.log("\n--- 6. Verifying Public Tracking for Resolved Grievance ---");
    const trackResolvedRes = await fetch(trackUrl);
    const trackResolvedData = await trackResolvedRes.json();

    assert(trackResolvedData.data.status === "RESOLVED", "Status updated to RESOLVED");
    assert(trackResolvedData.data.authorityReply === officialReplyText, "Official authority reply visible to student");
    assert(trackResolvedData.data.repliedAt !== null, "RepliedAt timestamp recorded");
    assert(
      trackResolvedData.data.statusLogs.some((l) => l.status === "RESOLVED"),
      "RESOLVED entry present in Activity Timeline"
    );

    // -------------------------------------------------------------
    // Step 7: Test Seed Data & Admin Dashboard API
    // -------------------------------------------------------------
    console.log("\n--- 7. Verifying Admin Complaints List & CSV Export ---");
    const listRes = await fetch(`${BASE_URL}/api/complaints`, {
      headers: { Cookie: cookieHeader },
    });
    const listData = await listRes.json();
    assert(listRes.ok && listData.success, "Admin complaints list accessible");
    assert(listData.data.total >= 6, `Total complaints count is ${listData.data.total} (includes seeded + new)`);

    const exportRes = await fetch(`${BASE_URL}/api/export`, {
      headers: { Cookie: cookieHeader },
    });
    assert(exportRes.ok, "CSV export endpoint returned HTTP 200");
    const csvText = await exportRes.text();
    assert(csvText.includes("Ticket ID") && csvText.includes(ticketId), "CSV contains header and new ticket ID");

    console.log("\n=======================================");
    console.log(`TOTAL: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Verification run encountered unexpected error:", err);
    process.exit(1);
  }
}

runTests();
