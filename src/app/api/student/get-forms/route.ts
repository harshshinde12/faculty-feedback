import connectDB from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    
    const Mapping = (await import("@/models/Mapping")).default;
    const FeedbackForm = (await import("@/models/Feedback")).default;
    const SubmissionStatus = (await import("@/models/SubmissionStatus")).default;
    // Ensure these models are registered
    await import("@/models/User");
    await import("@/models/Subject");

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    // 1. Fetch IDs of mappings already submitted
    // SubmissionStatus tracks (studentId + mappingId)
    const submittedRecords = await SubmissionStatus.find({ 
      studentId: user.id 
    }).select("mappingId");
    
    const submittedMappingIds = submittedRecords.map(rec => rec.mappingId.toString());

    // 2. Build Query for Mappings (Context: Dept, Class, Division, Batch)
    const mappingQuery: any = {
      deptId: user.deptId,
      classYear: user.academicYear, // e.g. "FE"
      division: user.division       // e.g. "A"
    };

    // Handle Batch Logic:
    // If student has a batch (e.g. "B1"), they see mappings for "B1" OR "All/null"
    // If student has no batch, they only see mappings for "All/null" (lectures)
    if (user.batch && user.batch !== "null") {
      mappingQuery.$or = [
        { batch: user.batch },
        { batch: null }, 
        { batch: "" }
      ];
    } else {
      mappingQuery.$or = [
        { batch: null }, 
        { batch: "" },
        { batch: { $exists: false } }
      ];
    }

    // 3. Find all applicable Mappings
    // Populate 'facultyId', 'subjectId' to show details
    const mappings = await Mapping.find(mappingQuery)
      .populate("facultyId", "username") // get faculty name
      .populate("subjectId", "name")     // get subject name
      .lean();

    // 4. For each mapping, find the active Feedback Form
    // The FeedbackForm is usually generic for a Dept/Year, OR specific.
    // We need to find a generic form that matches this context.
    // Assumption: There is an active FeedbackForm for this Dept + Year + Subject (or generic).
    // Let's check how FeedbackForm is defined. It has deptId, programId, academicYear, subjectId...
    
    // STRATEGY: 
    // We list the Mappings (Teacher X teaches Subject Y).
    // For each Mapping, we need to see if there is an ACTIVE FeedbackForm for Subject Y.
    // If yes, we combine them.

    const finalForms = [];

    for (const map of mappings) {
      // Skip if already submitted
      if (submittedMappingIds.includes(map._id.toString())) {
        continue;
      }

      // Find an active form for this Subject & Dept & Year
      // We can relax criteria if needed, but strict matching is safer.
      const activeForm = await FeedbackForm.findOne({
        deptId: user.deptId,
        academicYear: user.academicYear,
        subjectId: map.subjectId._id,
        isActive: true
      }).lean();

      if (activeForm) {
        finalForms.push({
          _id: map._id, // IMPORTANT: The ID we return is the MAPPING ID, not Form ID.
          title: activeForm.title,
          subject: map.subjectId,
          faculty: map.facultyId,
          questions: activeForm.questions,
          // We can pass other metadata if needed
          formOriginalId: activeForm._id 
        });
      }
    }

    return NextResponse.json(finalForms);
  } catch (error: any) {
    console.error("Fetch error:", error); 
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}