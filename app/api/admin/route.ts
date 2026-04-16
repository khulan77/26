import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Замаа өөрийнхөөрөө шалгаарай

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    // Энд статистик эсвэл бусад датаг нэмж явуулж болно
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: "Дата авахад алдаа гарлаа" }, { status: 500 });
  }
}