import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Амжилттай устлаа" });
  } catch (error) {
    return NextResponse.json({ error: "Устгахад алдаа гарлаа" }, { status: 500 });
  }
}