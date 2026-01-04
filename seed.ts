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
    const collections = ['users', 'departments', 'programs', 'subjects', 'mappings', 'feedbackforms', 'feedbackresponses'];
    for (const col of collections) {
      await db.collection(col).deleteMany({});
    }

    console.log("🌱 Seeding Comprehensive SPIT Mumbai Data...");

    // 1. Departments
    const depts = [
      { name: "Computer Engineering", code: "CMPN" },
      { name: "Information Technology", code: "IT" },
      { name: "Electronics & Telecom", code: "EXTC" },
      { name: "Artificial Intelligence & Data Science", code: "AIDS" }
    ];

    const deptDocs = await db.collection('departments').insertMany(
      depts.map(d => ({ ...d, createdAt: new Date(), updatedAt: new Date() }))
    );
    const deptMap: Record<string, any> = {}; // code -> _id
    Object.values(deptDocs.insertedIds).forEach((id, index) => {
      deptMap[depts[index].code] = id;
    });

    // 2. Programs
    const programs = [
      { name: "B.Tech Computer Engineering", code: "BTECH_CMPN", deptId: deptMap['CMPN'] },
      { name: "B.Tech IT", code: "BTECH_IT", deptId: deptMap['IT'] },
      { name: "B.Tech EXTC", code: "BTECH_EXTC", deptId: deptMap['EXTC'] },
      { name: "B.Tech AI & DS", code: "BTECH_AIDS", deptId: deptMap['AIDS'] },
    ];

    // Add academicYears and type to all
    const progDocs = await db.collection('programs').insertMany(
      programs.map(p => ({
        ...p,
        academicYears: ["FE", "SE", "TE", "BE"],
        type: "UG",
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    const progMap: Record<string, any> = {}; // code -> _id
    Object.values(progDocs.insertedIds).forEach((id, index) => {
      progMap[programs[index].code] = id;
    });

    // 3. Users -> Password
    const hashedPassword = await bcrypt.hash('spit123', 10);

    // 3.1 Admin
    await db.collection('users').insertOne({
      username: 'admin', password: hashedPassword, role: 'ADMIN', createdAt: new Date()
    });

    // 3.2 HODs (One per Dept)
    // 3.2 HODs (One per Dept)
    const hods = [
      { username: 'hod_cmpn', deptId: deptMap['CMPN'] },
      { username: 'hod_it', deptId: deptMap['IT'] },
      { username: 'hod_extc', deptId: deptMap['EXTC'] },
      { username: 'hod_aids', deptId: deptMap['AIDS'] }
    ];
    const insertedHods = await db.collection('users').insertMany(hods.map(h => ({ ...h, password: hashedPassword, role: 'HOD', createdAt: new Date() })));

    // Update Departments with hodId
    const hodIds = Object.values(insertedHods.insertedIds);
    for (let i = 0; i < hods.length; i++) {
      await db.collection('departments').updateOne(
        { _id: hods[i].deptId },
        { $set: { hodId: hodIds[i] } }
      );
    }

    // 3.3 Faculty (10 Total)
    const facultyData = [
      { username: 'prof_cmpn1', deptId: deptMap['CMPN'] }, // 0
      { username: 'prof_cmpn2', deptId: deptMap['CMPN'] }, // 1
      { username: 'prof_cmpn3', deptId: deptMap['CMPN'] }, // 2
      { username: 'prof_it1', deptId: deptMap['IT'] },     // 3
      { username: 'prof_it2', deptId: deptMap['IT'] },     // 4
      { username: 'prof_it3', deptId: deptMap['IT'] },     // 5
      { username: 'prof_extc1', deptId: deptMap['EXTC'] }, // 6
      { username: 'prof_extc2', deptId: deptMap['EXTC'] }, // 7
      { username: 'prof_aids1', deptId: deptMap['AIDS'] }, // 8
      { username: 'prof_aids2', deptId: deptMap['AIDS'] }, // 9
    ];
    const facDocs = await db.collection('users').insertMany(
      facultyData.map(f => ({ ...f, password: hashedPassword, role: 'FACULTY', createdAt: new Date() }))
    );
    const facultyIds = Object.values(facDocs.insertedIds);

    // 3.4 Students (10 Total, SE, Mixed Depts)
    const studentData = [
      { username: 'stu_cmpn_1', deptId: deptMap['CMPN'], programId: progMap['BTECH_CMPN'] },
      { username: 'stu_cmpn_2', deptId: deptMap['CMPN'], programId: progMap['BTECH_CMPN'] },
      { username: 'stu_cmpn_3', deptId: deptMap['CMPN'], programId: progMap['BTECH_CMPN'] },
      { username: 'stu_it_1', deptId: deptMap['IT'], programId: progMap['BTECH_IT'] },
      { username: 'stu_it_2', deptId: deptMap['IT'], programId: progMap['BTECH_IT'] },
      { username: 'stu_it_3', deptId: deptMap['IT'], programId: progMap['BTECH_IT'] },
      { username: 'stu_extc_1', deptId: deptMap['EXTC'], programId: progMap['BTECH_EXTC'] },
      { username: 'stu_extc_2', deptId: deptMap['EXTC'], programId: progMap['BTECH_EXTC'] },
      { username: 'stu_aids_1', deptId: deptMap['AIDS'], programId: progMap['BTECH_AIDS'] },
      { username: 'stu_aids_2', deptId: deptMap['AIDS'], programId: progMap['BTECH_AIDS'] },
    ];
    await db.collection('users').insertMany(
      studentData.map(s => ({
        ...s,
        password: hashedPassword,
        role: 'STUDENT',
        rollNo: `202420${Math.floor(Math.random() * 100)}`,
        academicYear: 'SE',
        division: 'A',
        batch: 'B1',
        createdAt: new Date()
      }))
    );

    // 4. Subjects (SE for all branches)
    // Structure: Name, DeptCode, FacIndex (0-9)
    const subjectDefinitions = [
      // CMPN
      { name: "Data Structures", dept: "CMPN", prog: "BTECH_CMPN", facIdx: 0 },
      { name: "Discrete Math", dept: "CMPN", prog: "BTECH_CMPN", facIdx: 1 },
      { name: "Comp. Org. & Arch", dept: "CMPN", prog: "BTECH_CMPN", facIdx: 2 },
      // IT
      { name: "Database Mgmt Systems", dept: "IT", prog: "BTECH_IT", facIdx: 3 },
      { name: "Java Programming", dept: "IT", prog: "BTECH_IT", facIdx: 4 },
      { name: "Automata Theory", dept: "IT", prog: "BTECH_IT", facIdx: 5 },
      // EXTC
      { name: "Analog Circuits", dept: "EXTC", prog: "BTECH_EXTC", facIdx: 6 },
      { name: "Digital System Design", dept: "EXTC", prog: "BTECH_EXTC", facIdx: 7 },
      { name: "Signals & Systems", dept: "EXTC", prog: "BTECH_EXTC", facIdx: 6 }, // Reusing fac 6
      // AIDS
      { name: "AI Foundations", dept: "AIDS", prog: "BTECH_AIDS", facIdx: 8 },
      { name: "Python for Data Science", dept: "AIDS", prog: "BTECH_AIDS", facIdx: 9 },
      { name: "Statistics", dept: "AIDS", prog: "BTECH_AIDS", facIdx: 8 }, // Reusing fac 8
    ];

    const subjectDocs = [];
    for (const sub of subjectDefinitions) {
      const facId = facultyIds[sub.facIdx];
      const doc = {
        name: sub.name,
        code: `SUB-${sub.dept}-${Math.floor(Math.random() * 1000)}`,
        deptId: deptMap[sub.dept],
        programId: progMap[sub.prog],
        facultyId: facId,
        academicYear: "SE", // All SE as requested
        division: "A",
        createdAt: new Date()
      };
      subjectDocs.push(doc);
    }
    const insertedSubjects = await db.collection('subjects').insertMany(subjectDocs);
    const subIds = Object.values(insertedSubjects.insertedIds);

    // 5. Mappings & 6. Feedback Forms
    // For each subject, create mapping and 2 forms
    let formCount = 0;

    for (let i = 0; i < subjectDocs.length; i++) {
      const subId = subIds[i];
      const subDef = subjectDocs[i];
      const facId = subDef.facultyId;
      const facName = facultyData[subjectDefinitions[i].facIdx].username;

      // Mapping
      await db.collection('mappings').insertOne({
        facultyId: facId,
        subjectId: subId,
        deptId: subDef.deptId,
        programId: subDef.programId,
        classYear: "SE",
        division: "A",
        createdAt: new Date()
      });

      // 2 Forms: Mid Sem & End Sem
      const formTypes = ["Mid Sem Feedback", "End Sem Feedback"];
      for (const fType of formTypes) {
        await db.collection('feedbackforms').insertOne({
          title: `${fType} - ${subDef.name}`,
          deptId: subDef.deptId,
          programId: subDef.programId,
          academicYear: "SE",
          subjectId: subId,
          facultyId: facId,
          facultyName: facName,
          division: "A",
          isActive: true,
          questions: [
            { questionText: "Concept Clarity", type: "rating" },
            { questionText: "Punctuality", type: "rating" },
            { questionText: "Classroom Interaction", type: "rating" }
          ],
          createdAt: new Date()
        });
        formCount++;
      }
    }

    console.log(`✅ Seeded:
    - 4 Departments
    - 4 HODs
    - 10 Faculty
    - 10 Students (SE)
    - ${subjectDocs.length} Subjects
    - ${formCount} Feedback Forms`);

    console.log("-----------------------------------------");
    console.log("Credentials (Password: spit123):");
    console.log("Admin: admin");
    console.log("HOD Examples: hod_cmpn, hod_it");
    console.log("Faculty Examples: prof_cmpn1, prof_it1");
    console.log("Student Examples: stu_cmpn_1, stu_it_1");

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();