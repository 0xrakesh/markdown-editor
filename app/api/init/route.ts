import { createDemoUser } from "@/app/actions"
import { NextResponse } from "next/server"

export async function GET() {
  const result = await createDemoUser()

  return NextResponse.json(result)
}
