const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function seedResponses() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Please define MONGODB_URI in .env.local");

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        console.log("🌱 Seeding Feedback Responses...");

        // Find the active form created by seed.ts
        const form = await db.collection('feedbackforms').findOne({ title: "End Semester Feedback - Dec 2024" });

        if (!form) {
            console.error("❌ Form not found. Run seed.ts first!");
            return;
        }

        // Find the mapping for this form (Prof DSA -> DSA Subject)
        // In seed.ts: 'programId', 'classYear', 'division', 'subjectId', 'facultyId' are consistent.
        // We need 'mappingId' for FeedbackResponse.
        // Let's find the mapping based on faculty and subject.
        const mapping = await db.collection('mappings').findOne({
            facultyId: form.facultyId,
            subjectId: form.subjectId,
            division: form.division
        });

        if (!mapping) {
            console.error("❌ Mapping not found.");
            return;
        }

        const responses = [];
        const totalStudents = 50;

        for (let i = 0; i < totalStudents; i++) {
            // Generate random ratings 1-5, weighted towards higher numbers
            const r1 = Math.random() > 0.1 ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1; // 3,4,5 mostly
            const r2 = Math.random() > 0.2 ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1;
            const r3 = Math.floor(Math.random() * 5) + 1;

            responses.push({
                formId: form._id,
                mappingId: mapping._id,
                studentId: new ObjectId(), // Anonymous
                ratings: {
                    "0": r1, // Concept Clarity
                    "1": r2, // Punctuality
                    "2": r3  // Doubt Solving
                },
                comments: Math.random() > 0.7 ? "Great session!" : "",
                createdAt: new Date()
            });
        }

        await db.collection('feedbackresponses').insertMany(responses);

        console.log(`✅ Seeded ${totalStudents} feedback responses!`);

    } catch (error) {
        console.error('❌ Error seeding responses:', error);
    } finally {
        await client.close();
    }
}

seedResponses();
