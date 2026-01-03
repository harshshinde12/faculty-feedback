import connectDB from "@/lib/db";
import Department from "@/models/Department";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, hodUsername } = await req.json();

    // 1. Find the user by username first
    const hodUser = await User.findOne({ username: hodUsername });

    if (!hodUser) {
      return NextResponse.json(
        { error: "User not found. Please create the HOD user account first." },
        { status: 404 }
      );
    }

    // 2. Create the Department with the found User's ID
    const dept = await Department.create({
      name,
      hodId: hodUser._id
    });

    // 3. Update the User: assign the Dept ID and force the HOD role
    await User.findByIdAndUpdate(hodUser._id, {
      role: 'HOD',
      deptId: dept._id
    });

    return NextResponse.json({
      message: "Department created and HOD linked successfully",
      dept
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const depts = await Department.find({});
    return NextResponse.json(depts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Department.findByIdAndDelete(id);
    // Optional: Reset HOD role for the associated user? leaving as is for now to be safe.

    return NextResponse.json({ message: "Department deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, hodUsername } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updateData: any = { name };

    // If HOD is being changed
    if (hodUsername) {
      const User = (await import("@/models/User")).default;
      const hodUser = await User.findOne({ username: hodUsername });
      if (!hodUser) {
        return NextResponse.json({ error: "HOD User not found" }, { status: 404 });
      }
      updateData.hodId = hodUser._id;

      // Update User to reflect HOD role if not already
      await User.findByIdAndUpdate(hodUser._id, { role: 'HOD', deptId: id });
    }

    const updatedDept = await Department.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json(updatedDept);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}