import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ─── Super Admin ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {},
    create: {
      name: "College Proctor",
      email: "admin@college.edu",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Super Admin created: ${admin.email}`);

  // ─── Helper dates ──────────────────────────────────────────────────────────
  const now = new Date();

  function daysAgo(d: number) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    return dt;
  }

  function addHours(dt: Date, h: number) {
    return new Date(dt.getTime() + h * 60 * 60 * 1000);
  }

  function addDays(dt: Date, d: number) {
    const result = new Date(dt);
    result.setDate(result.getDate() + d);
    return result;
  }

  // ─── Helper: next ticket ID ────────────────────────────────────────────────
  async function nextTicketId(year: number): Promise<string> {
    const count = await prisma.complaint.count({
      where: { ticketId: { startsWith: `GRV-${year}-` } },
    });
    const seq = String(count + 1).padStart(4, "0");
    return `GRV-${year}-${seq}`;
  }

  const year = now.getFullYear();

  // ─── Complaint 1: REGISTERED today (within SLA) ───────────────────────────
  const c1Created = daysAgo(0);
  await prisma.complaint.upsert({
    where: { ticketId: `GRV-${year}-0001` },
    update: {},
    create: {
      ticketId: `GRV-${year}-0001`,
      studentName: "Arjun Mehta",
      studentRoll: "CS2023001",
      studentEmail: "arjun.mehta@student.edu",
      studentPhone: "9876543210",
      category: "ACADEMIC",
      subject: "Discrepancy in internal marks for Data Structures",
      description:
        "I have noticed a significant discrepancy in my internal assessment marks for the Data Structures subject (CS301). My assignment was graded 15/25 but the marks uploaded on the portal show 8/25. I request a re-evaluation of my answer scripts.",
      status: "REGISTERED",
      ackDueDate: addHours(c1Created, 48),
      slaDueDate: addDays(c1Created, 7),
      createdAt: c1Created,
      updatedAt: c1Created,
      statusLogs: {
        create: {
          status: "REGISTERED",
          comment: "Complaint successfully registered via portal.",
          changedBy: "System",
          createdAt: c1Created,
        },
      },
    },
  });

  // ─── Complaint 2: REGISTERED 4 days ago (ACK SLA breached) ───────────────
  const c2Created = daysAgo(4);
  await prisma.complaint.upsert({
    where: { ticketId: `GRV-${year}-0002` },
    update: {},
    create: {
      ticketId: `GRV-${year}-0002`,
      studentName: "Priya Sharma",
      studentRoll: "ME2022045",
      studentEmail: "priya.sharma@student.edu",
      studentPhone: "9123456789",
      category: "HOSTEL_MESS",
      subject: "Unhygienic food quality in hostel mess Block-C",
      description:
        "The food quality served in the hostel mess Block-C has been consistently poor for the past two weeks. Several students have reported stomach ailments. The vegetables are often undercooked and the drinking water dispenser has not been cleaned. Immediate action is required to prevent health hazards.",
      status: "REGISTERED",
      ackDueDate: addHours(c2Created, 48),
      slaDueDate: addDays(c2Created, 7),
      createdAt: c2Created,
      updatedAt: c2Created,
      statusLogs: {
        create: {
          status: "REGISTERED",
          comment: "Complaint successfully registered via portal.",
          changedBy: "System",
          createdAt: c2Created,
        },
      },
    },
  });

  // ─── Complaint 3: IN_PROGRESS 8 days ago (Resolution SLA breached) ────────
  const c3Created = daysAgo(8);
  await prisma.complaint.upsert({
    where: { ticketId: `GRV-${year}-0003` },
    update: {},
    create: {
      ticketId: `GRV-${year}-0003`,
      studentName: "Rohit Verma",
      studentRoll: "EC2021078",
      studentEmail: "rohit.verma@student.edu",
      category: "FEES_SCHOLARSHIP",
      subject: "Merit scholarship not credited for second semester",
      description:
        "As per the scholarship notification issued on 15th March, the merit-based scholarship of Rs. 25,000 was to be credited to all eligible students by April 30th. My student ID (EC2021078) qualifies as per the academic criteria, but the amount has not yet been reflected in my fee portal. I request urgent intervention.",
      status: "IN_PROGRESS",
      assignedTo: "Accounts Officer",
      ackDueDate: addHours(c3Created, 48),
      slaDueDate: addDays(c3Created, 7),
      createdAt: c3Created,
      updatedAt: daysAgo(6),
      statusLogs: {
        createMany: {
          data: [
            {
              id: "log-c3-1",
              status: "REGISTERED",
              comment: "Complaint successfully registered via portal.",
              changedBy: "System",
              createdAt: c3Created,
            },
            {
              id: "log-c3-2",
              status: "ACKNOWLEDGED",
              comment: "Complaint acknowledged. Forwarded to Accounts Department.",
              changedBy: "College Proctor",
              createdAt: daysAgo(7),
            },
            {
              id: "log-c3-3",
              status: "IN_PROGRESS",
              comment: "Accounts Officer is verifying the scholarship eligibility records.",
              changedBy: "College Proctor",
              createdAt: daysAgo(6),
            },
          ],
        },
      },
    },
  });

  // ─── Complaint 4: RESOLVED with official reply ────────────────────────────
  const c4Created = daysAgo(12);
  const c4Resolved = daysAgo(3);
  await prisma.complaint.upsert({
    where: { ticketId: `GRV-${year}-0004` },
    update: {},
    create: {
      ticketId: `GRV-${year}-0004`,
      studentName: "Ananya Krishnan",
      studentRoll: "CS2022112",
      studentEmail: "ananya.krishnan@student.edu",
      studentPhone: "9988776655",
      category: "EXAMINATION",
      subject: "Request for re-evaluation of End Semester Answer Script",
      description:
        "I am dissatisfied with my marks obtained in the End Semester Examination for the subject Software Engineering (CS401). I scored 42/100 which does not reflect my performance. I request a formal re-evaluation of my answer script as per the university guidelines.",
      status: "RESOLVED",
      assignedTo: "Examination Controller",
      authorityReply:
        "Dear Ms. Ananya Krishnan, your request for re-evaluation of the Software Engineering (CS401) answer script has been duly processed. Upon careful re-evaluation by the subject expert panel, your revised marks have been updated to 58/100. The correction has been submitted to the university examination board and will be reflected in your official marksheet within 15 working days. We appreciate your patience and encourage you to reach out for any further clarifications.",
      repliedAt: c4Resolved,
      ackDueDate: addHours(c4Created, 48),
      slaDueDate: addDays(c4Created, 7),
      createdAt: c4Created,
      updatedAt: c4Resolved,
      statusLogs: {
        createMany: {
          data: [
            {
              id: "log-c4-1",
              status: "REGISTERED",
              comment: "Complaint registered.",
              changedBy: "System",
              createdAt: c4Created,
            },
            {
              id: "log-c4-2",
              status: "ACKNOWLEDGED",
              comment: "Received. Forwarded to Examination Controller.",
              changedBy: "College Proctor",
              createdAt: daysAgo(11),
            },
            {
              id: "log-c4-3",
              status: "IN_PROGRESS",
              comment: "Answer script retrieved. Re-evaluation panel constituted.",
              changedBy: "Examination Controller",
              createdAt: daysAgo(9),
            },
            {
              id: "log-c4-4",
              status: "RESOLVED",
              comment: "Re-evaluation completed. Official reply issued to student.",
              changedBy: "Examination Controller",
              createdAt: c4Resolved,
            },
          ],
        },
      },
    },
  });

  // ─── Complaint 5: CLOSED historical ───────────────────────────────────────
  const c5Created = daysAgo(30);
  const c5Closed = daysAgo(20);
  await prisma.complaint.upsert({
    where: { ticketId: `GRV-${year}-0005` },
    update: {},
    create: {
      ticketId: `GRV-${year}-0005`,
      studentName: "Dev Patel",
      studentRoll: "CI2021033",
      studentEmail: "dev.patel@student.edu",
      category: "INFRASTRUCTURE_MAINTENANCE",
      subject: "Broken furniture and non-functional fans in Room 204",
      description:
        "The study room 204 in the academic block has three broken chairs and two non-functional ceiling fans since the start of the semester. Students are unable to use the room effectively for self-study. Immediate maintenance is requested.",
      status: "CLOSED",
      assignedTo: "Maintenance Officer",
      authorityReply:
        "Dear Mr. Dev Patel, we are pleased to inform you that the maintenance work for Room 204 has been completed. All three chairs have been replaced with new ones and both ceiling fans have been repaired and are fully functional. We apologize for the inconvenience caused and assure you of better maintenance standards going forward. This grievance is now formally closed.",
      repliedAt: daysAgo(22),
      ackDueDate: addHours(c5Created, 48),
      slaDueDate: addDays(c5Created, 7),
      createdAt: c5Created,
      updatedAt: c5Closed,
      statusLogs: {
        createMany: {
          data: [
            {
              id: "log-c5-1",
              status: "REGISTERED",
              comment: "Complaint registered.",
              changedBy: "System",
              createdAt: c5Created,
            },
            {
              id: "log-c5-2",
              status: "ACKNOWLEDGED",
              comment: "Acknowledged. Forwarded to Maintenance.",
              changedBy: "College Proctor",
              createdAt: daysAgo(29),
            },
            {
              id: "log-c5-3",
              status: "IN_PROGRESS",
              comment: "Maintenance work scheduled.",
              changedBy: "Maintenance Officer",
              createdAt: daysAgo(27),
            },
            {
              id: "log-c5-4",
              status: "RESOLVED",
              comment: "Maintenance work completed. Student notified.",
              changedBy: "Maintenance Officer",
              createdAt: daysAgo(22),
            },
            {
              id: "log-c5-5",
              status: "CLOSED",
              comment: "Student confirmed resolution. Grievance formally closed.",
              changedBy: "College Proctor",
              createdAt: c5Closed,
            },
          ],
        },
      },
    },
  });

  console.log("✅ 5 test complaints seeded successfully.");
  console.log("\n📋 Seed Summary:");
  console.log("   Admin: admin@college.edu / Admin@123");
  console.log(`   Complaint 1: GRV-${year}-0001 — REGISTERED (within SLA)`);
  console.log(`   Complaint 2: GRV-${year}-0002 — REGISTERED (ACK SLA breached — 4 days old)`);
  console.log(`   Complaint 3: GRV-${year}-0003 — IN_PROGRESS (Resolution SLA breached — 8 days old)`);
  console.log(`   Complaint 4: GRV-${year}-0004 — RESOLVED (with official reply)`);
  console.log(`   Complaint 5: GRV-${year}-0005 — CLOSED (historical)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
