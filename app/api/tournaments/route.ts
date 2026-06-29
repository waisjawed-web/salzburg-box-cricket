import { NextResponse } from "next/server";
import { tournaments } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ tournaments });
}
