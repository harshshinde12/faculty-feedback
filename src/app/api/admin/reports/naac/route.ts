import connectDB from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Dynamic Imports
        const Mapping = (await import("@/models/Mapping")).default;
        const FeedbackResponse = (await import("@/models/FeedbackResponse")).default;
        const User = (await import("@/models/User")).default;
        // Ensure models are registered
        await import("@/models/Subject");

        // 1. Get all Mappings with details
        const mappings = await Mapping.find()
            .populate("subjectId", "name")
            .populate("facultyId", "username")
            .lean();

        // 2. Aggregate Feedback Stats (Count & Avg Rating) by Mapping
        const feedbackStats = await FeedbackResponse.aggregate([
            {
                $group: {
                    _id: "$mappingId",
                    responseCount: { $sum: 1 },
                    avgRating: { $avg: { $avg: { $objectToArray: "$ratings" } } }
                    // Note: $avg of objectToArray might need simpler logic if ratings is a simple map. 
                    // Let's refine avg rating calc:
                    // The 'ratings' field is like { q1: 5, q2: 4 }.
                    // We can't easily avg inside the group without unwinding or projecting first.
                    // Simpler: Just get all docs or arrays? 
                    // Let's try Project first.
                }
            }
        ]);
        // The avgRating above is tricky with mixed keys. 
        // Alternative: We fetching counts here. For avg rating, let's fetch 'ratings' and calc in JS or use a better pipeline.
        // Let's use a simpler pipeline to just get counts and ALL ratings arrays, then process in JS for accuracy.
        const feedbackRaw = await FeedbackResponse.find({}, { mappingId: 1, ratings: 1 }).lean();

        // Process Feedback Data in Memory
        const feedbackMap = new Map();
        feedbackRaw.forEach((f: any) => {
            const mid = f.mappingId.toString();
            if (!feedbackMap.has(mid)) {
                feedbackMap.set(mid, { count: 0, totalScore: 0, totalQuestions: 0 });
            }
            const entry = feedbackMap.get(mid);
            entry.count++;

            // Calculate sum of ratings for this response
            if (f.ratings) {
                let sum = 0;
                let qCount = 0;
                Object.values(f.ratings).forEach((v: any) => {
                    if (typeof v === 'number') {
                        sum += v;
                        qCount++;
                    }
                });
                if (qCount > 0) {
                    entry.totalScore += (sum / qCount); // Average for this response
                    entry.totalQuestions++; // Actually just counting this as 1 "response average" unit
                }
            }
        });

        // 3. Aggregate Students by Class Context
        const students = await User.aggregate([
            { $match: { role: "STUDENT" } },
            {
                $group: {
                    _id: {
                        dept: "$deptId",
                        year: "$academicYear",
                        div: "$division",
                        batch: "$batch"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Helper to find student count for a mapping
        const getStudentCount = (m: any) => {
            let count = 0;
            students.forEach((s: any) => {
                const { dept, year, div, batch } = s._id;
                // Match Department, Year, Division
                const deptMatch = String(dept) === String(m.deptId);
                const yearMatch = year === m.classYear;
                const divMatch = div === m.division;

                if (deptMatch && yearMatch && divMatch) {
                    if (m.batch) {
                        // Specific batch mapping: Only match specific batch
                        if (batch === m.batch) count += s.count;
                    } else {
                        // Division mapping: Include chunks with any batch or no batch in this division
                        // (Assuming 'division' mapping covers whole division)
                        count += s.count;
                    }
                }
            });
            return count;
        };

        // 4. Combine
        const report = mappings.map((m: any) => {
            const mid = m._id.toString();
            const fb = feedbackMap.get(mid) || { count: 0, totalScore: 0, totalQuestions: 0 };
            const avgRating = fb.count > 0 ? (fb.totalScore / fb.count) : 0;

            const expectedStudents = getStudentCount(m);
            const participationRate = expectedStudents > 0
                ? (fb.count / expectedStudents) * 100
                : 0;

            return {
                _id: m._id,
                subject: m.subjectId?.name || "Unknown",
                faculty: m.facultyId?.username || "Unknown",
                class: `${m.classYear} - ${m.division} ${m.batch ? `(${m.batch})` : ''}`,
                totalStudents: expectedStudents,
                responses: fb.count,
                participationRate,
                satisfactionIndex: avgRating
            };
        });

        return NextResponse.json(report);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
