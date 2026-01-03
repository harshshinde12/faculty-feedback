import connectDB from "@/lib/db";
import FeedbackResponse from "@/models/FeedbackResponse";
import Mapping from "@/models/Mapping";
// Ensure models are registered
import "@/models/User";
import "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hodDeptId = new mongoose.Types.ObjectId(session.user.deptId);

    // AGGREGATION PIPELINE
    // 1. Match responses related to the HOD's department.
    //    We need to filter Mappings by Dept first, then find Responses?
    //    Actually, FeedbackResponse -> Mapping. Mapping has deptId.
    //    So we start with Mapping to filter by Dept, then Lookup Responses?
    //    Better: Start with FeedbackResponse, Lookup Mapping, Filter by Mapping.deptId.

    const analytics = await FeedbackResponse.aggregate([
      // A. Lookup Mapping to get details
      {
        $lookup: {
          from: "mappings",
          localField: "mappingId",
          foreignField: "_id",
          as: "mapping"
        }
      },
      { $unwind: "$mapping" },

      // B. Filter by HOD's Department
      {
        $match: {
          "mapping.deptId": hodDeptId
        }
      },

      // C. Group by Mapping (Faculty + Subject + Batch/Div context)
      {
        $group: {
          _id: "$mapping._id",
          mappingId: { $first: "$mapping._id" },
          facultyId: { $first: "$mapping.facultyId" },
          subjectId: { $first: "$mapping.subjectId" },
          classYear: { $first: "$mapping.classYear" },
          division: { $first: "$mapping.division" },
          totalSubmissions: { $sum: 1 },

          // Calculate Average of averages? Or flattened average?
          // 'ratings' is a Map/Object like { '0': 5, '1': 4 }
          // We need to calculate average per document first?
          // Complexity: 'ratings' is schema type Mixed.
          // Strategy: Push all ratings arrays and process in next stage or client?
          // Better: Use $objectToArray to convert ratings to array, then average.
          ratings: { $push: "$ratings" }
        }
      },

      // D. Lookup Faculty Details
      {
        $lookup: {
          from: "users",
          localField: "facultyId",
          foreignField: "_id",
          as: "faculty"
        }
      },
      { $unwind: "$faculty" },

      // E. Lookup Subject Details
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" }
    ]);

    // REFINE DATA (Calculate Averages in JS for simplicity with Mixed types)
    const refinedAnalytics = analytics.map(item => {
      let totalScore = 0;
      let totalQuestions = 0;

      // Iterate through all submissions for this mapping
      item.ratings.forEach((r: any) => {
        const values = Object.values(r).map((v: any) => Number(v));
        const sum = values.reduce((a, b) => a + b, 0);
        totalScore += sum;
        totalQuestions += values.length;
      });

      const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;

      return {
        _id: item._id,
        facultyName: item.faculty.username,
        subjectName: item.subject.name,
        classYear: item.classYear,
        division: item.division,
        totalSubmissions: item.totalSubmissions,
        averageRating: overallAverage.toFixed(2)
      };
    });

    return NextResponse.json(refinedAnalytics);

  } catch (error: any) {
    console.error("HOD Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}