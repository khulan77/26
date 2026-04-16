import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Замаа шалгаарай

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, price, image, description, tags, stock, location, sellerId } = body;

    // Баталгаажуулалт
    if (!name || !price || !sellerId) {
      return NextResponse.json({ error: "Нэр, үнэ болон борлуулагч заавал байх ёстой" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        image,
        description,
        tags,
        stock,
        location,
        sellerId, // Clerk-ээс ирсэн DB-ийн User ID
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product Create Error:", error);
    return NextResponse.json({ error: "Бараа нэмэхэд алдаа гарлаа" }, { status: 500 });
  }
}