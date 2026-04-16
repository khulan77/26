import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function scoreProduct(product: any, query: string) {
  const q = query.toLowerCase().trim();
  let score = 0;

  const haystack = [
    product.name,
    product.category,
    product.description,
    ...(product.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  q.split(/\s+/).forEach((word) => {
    if (product.name.toLowerCase().includes(word)) score += 5;
    if (product.category.toLowerCase().includes(word)) score += 3;
    if (haystack.includes(word)) score += 2;
  });

  return score;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const products = await prisma.product.findMany();

    const ranked = products
      .map((p) => ({
        ...p,
        score: scoreProduct(p, message),
      }))
      .sort((a, b) => b.score - a.score);

    const matched = ranked.filter((p) => p.score > 0).slice(0, 6);

    if (matched.length > 0) {
      return NextResponse.json({
        reply: `Таны хайлтанд ${matched.length} бараа олдлоо.`,
        products: matched,
        type: "exact",
      });
    }

    return NextResponse.json({
      reply: "Яг тохирох бараа олдсонгүй. Гэхдээ төстэй бараа санал болгож байна.",
      products: ranked.slice(0, 4),
      type: "similar",
    });
  } catch (error) {
    console.error("CHAT_ERROR", error);
    return NextResponse.json(
      { error: "Chat search failed" },
      { status: 500 }
    );
  }
}