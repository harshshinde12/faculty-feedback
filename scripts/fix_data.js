const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Define Schemas (Minimal, but enough to update)
const Program = mongoose.models.Program || mongoose.model('Program', new mongoose.Schema({}, { strict: false }));
const Subject = mongoose.models.Subject || mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Fix Programs
        const pRes = await Program.updateMany(
            { academicYears: { $exists: false } },
            { $set: { academicYears: ["FE", "SE", "TE", "BE"], type: "UG" } }
        );
        console.log(`Programs updated: ${pRes.modifiedCount}`);

        // 2. Fix Subjects (Set default SE and A)
        const sRes = await Subject.updateMany(
            { academicYear: { $exists: false } },
            { $set: { academicYear: "SE", division: "A" } }
        );
        console.log(`Subjects updated: ${sRes.modifiedCount}`);

        // 3. Fix missing facultyId in Subjects if any
        // Find a faculty first
        const faculty = await User.findOne({ role: 'FACULTY' });
        if (faculty) {
            const sFacRes = await Subject.updateMany(
                { facultyId: { $exists: false } },
                { $set: { facultyId: faculty._id } }
            );
            console.log(`Subjects facultyId fixed: ${sFacRes.modifiedCount}`);
        } else {
            console.log("No faculty found to link to subjects.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
