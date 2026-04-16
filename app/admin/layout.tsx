import { auth } from "@clerk/nextjs/server"; // ЗӨВ: /server нэмэгдсэн
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth(); // Clerk v5 дээр auth() нь await хийгддэг болсон

  if (!userId) {
    redirect("/sign-in");
  }

  // DB-ээс хэрэглэгчийн ролийг шалгах
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  // Хэрвээ админ биш бол нүүр хуудас руу буцаах
  if (dbUser?.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}