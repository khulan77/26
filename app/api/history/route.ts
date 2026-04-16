import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    return Response.json({ ok: true, route: "history" });
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const histories = await prisma.chatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(histories);
  } catch (error) {
    console.error("GET_HISTORY_ERROR", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const history = await prisma.chatHistory.create({
      data: {
        query: body.query,
        type: body.type || "text",
        userId: user.id,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("CREATE_HISTORY_ERROR", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}