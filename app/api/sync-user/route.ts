import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User";

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name,
      },
      create: {
        clerkId: userId,
        email,
        name,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("SYNC_USER_ERROR", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}