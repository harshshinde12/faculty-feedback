const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Please define MONGODB_URI in .env.local");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    console.log("🧹 Clearing existing data...");
    await db.collection('users').deleteMany({});
    await db.collection('departments').deleteMany({});
    await db.collection('programs').deleteMany({});
    await db.collection('subjects').deleteMany({});
    await db.collection('mappings').deleteMany({});
    await db.collection('feedbackforms').deleteMany({});
    await db.collection('feedbackresponses').deleteMany({});

    console.log("🌱 Seeding SPIT Mumbai Data...");

    // 1. Create Departments (SPIT has CMPN, IT, EXTC, AIDS)
    const depts = [
      { name: "Computer Engineering", code: "CMPN" },
      { name: "Information Technology", code: "IT" },
      { name: "Electronics & Telecom", code: "EXTC" },
      { name: "Artificial Intelligence & Data Science", code: "AIDS" }
    ];

    const deptDocs = await db.collection('departments').insertMany(
      depts.map(d => ({ ...d, createdAt: new Date(), updatedAt: new Date() }))
    );
    // Map code back to ID (e.g. { CMPN: ObjectId(...) })
    const deptMap: Record<string, any> = {};
    Object.values(deptDocs.insertedIds).forEach((id: any, index: number) => {
      deptMap[depts[index].code] = id;
    });

    // 2. Create Programs (B.Tech for each Dept)
    const programs = [
      { name: "B.Tech Computer Engineering", code: "BTECH_CMPN", deptId: deptMap['CMPN'] },
      { name: "B.Tech IT", code: "BTECH_IT", deptId: deptMap['IT'] },
      { name: "B.Tech EXTC", code: "BTECH_EXTC", deptId: deptMap['EXTC'] },
      { name: "B.Tech AI & DS", code: "BTECH_AIDS", deptId: deptMap['AIDS'] },
    ];

    const progDocs = await db.collection('programs').insertMany(
      programs.map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() }))
    );
    // Rough map for usage
    const progId_CMPN = Object.values(progDocs.insertedIds)[0];

    // 3. Create Users
    const hashedPassword = await bcrypt.hash('spit123', 10); // Standard password 'spit123'

    // Admin
    await db.collection('users').insertOne({
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      createdAt: new Date()
    });

    // HOD CMPN
    await db.collection('users').insertOne({
      username: 'hod_cmpn',
      password: hashedPassword,
      role: 'HOD',
      deptId: deptMap['CMPN'],
      createdAt: new Date()
    });

    // Faculty (SPIT style)
    const facultyData = [
      { username: 'prof_dsa', deptId: deptMap['CMPN'] },
      { username: 'prof_automata', deptId: deptMap['CMPN'] },
      { username: 'prof_dbms', deptId: deptMap['IT'] }
    ];

    const facultyDocs = await db.collection('users').insertMany(
      facultyData.map(f => ({ ...f, password: hashedPassword, role: 'FACULTY', createdAt: new Date() }))
    );
    const facultyId_DSA = Object.values(facultyDocs.insertedIds)[0];

    // Students
    await db.collection('users').insertOne({
      username: 'student_se_cmpn',
      password: hashedPassword,
      role: 'STUDENT',
      deptId: deptMap['CMPN'],
      programId: progId_CMPN,
      rollNo: "2024101",
      academicYear: "SE", // Second Year
      division: "A",
      batch: "B1",
      createdAt: new Date()
    });

    // 4. Create Subjects
    const subResult = await db.collection('subjects').insertOne({
      name: "Data Structures & Algorithms",
      code: "CSC302",
      deptId: deptMap['CMPN'],
      programId: progId_CMPN,
      semester: 3,
      credits: 4,
      createdAt: new Date()
    });
    const subjectId = subResult.insertedId;

    // 5. Create Mapping (Prof DSA teaches DSA to SE-A)
    await db.collection('mappings').insertOne({
      facultyId: facultyId_DSA,
      subjectId: subjectId,
      deptId: deptMap['CMPN'],
      programId: progId_CMPN,
      classYear: "SE",
      division: "A",
      createdAt: new Date()
    });

    // 6. Active Feedback Form
    await db.collection('feedbackforms').insertOne({
      title: "End Semester Feedback - Dec 2024",
      deptId: deptMap['CMPN'],
      programId: progId_CMPN,
      academicYear: "SE",
      subjectId: subjectId,
      facultyId: facultyId_DSA,
      facultyName: "prof_dsa",
      division: "A",
      isActive: true,
      questions: [
        { questionText: "Concept Clarity", type: "rating" },
        { questionText: "Punctuality", type: "rating" },
        { questionText: "Doubt Solving", type: "rating" }
      ],
      createdAt: new Date()
    });

    console.log("✅ SPIT Mumbai Data Seeded!");
    console.log("-----------------------------------------");
    console.log("Admin:    admin / spit123");
    console.log("HOD:      hod_cmpn / spit123");
    console.log("Faculty:  prof_dsa / spit123");
    console.log("Student:  student_se_cmpn / spit123");

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();