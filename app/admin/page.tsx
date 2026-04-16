import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Замаа @/lib/prisma гэж шалгаарай
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const { userId } = await auth();

  // 1. Нэвтрээгүй бол sign-in руу
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. DB-ээс хэрэглэгчээ хайх
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // 3. Хэрэглэгч олдохгүй эсвэл эрх нь хүрэхгүй бол нүүр хуудас руу
  if (!dbUser || (dbUser.role !== "SELLER" && dbUser.role !== "ADMIN")) {
    // Хэрвээ чи одоохондоо DB дээрээ ADMIN болж амжаагүй бол 
    // Энэ хэсгийг ТҮР зуур коммент болгоод туршиж болно.
    redirect("/");
  }

  // 4. Бүх зүйл OK бол AdminClient руу ID-г нь дамжуулна
  return <AdminClient sellerId={dbUser.id} />;
}