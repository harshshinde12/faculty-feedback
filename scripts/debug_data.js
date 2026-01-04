const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const ProgramSchema = new mongoose.Schema({
    name: String,
    academicYears: mongoose.Schema.Types.Mixed
});
const SubjectSchema = new mongoose.Schema({
    name: String,
    programId: mongoose.Schema.Types.ObjectId,
    academicYear: String,
    division: String
});

const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const programs = await Program.find({});
        const subjects = await Subject.find({});

        const output = {
            programs: programs.map(p => ({
                id: p._id,
                name: p.name,
                academicYears: p.academicYears,
                type: typeof p.academicYears
            })),
            subjects: subjects.map(s => ({
                id: s._id,
                name: s.name,
                programId: s.programId,
                academicYear: s.academicYear,
                division: s.division
            }))
        };

        fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
        console.log('Written to debug_output.json');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
