import connectDB from "@/lib/db";
import Program from "@/models/Program";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, type, deptId, academicYears } = await req.json();

    if (!name || !type || !deptId || !academicYears) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const program = await Program.create({ name, type, deptId, academicYears });
    return NextResponse.json(program);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("deptId");

    // If deptId is provided, filter programs. Otherwise, return all.
    const query = deptId ? { deptId } : {};
    const programs = await Program.find(query).lean();

    return NextResponse.json(programs);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await Program.findByIdAndDelete(id);
    return NextResponse.json({ message: "Program deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const updated = await Program.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}