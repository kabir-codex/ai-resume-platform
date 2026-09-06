import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatReply } from "@/lib/openai";
import { aiRateLimiter } from "@/lib/middleware/rate-limiter";
import { validateRequest, chatSchema } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const rateLimitResponse = await aiRateLimiter(req);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json();
  const validation = validateRequest(chatSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { message, history } = validation.data;

  const reply = await chatReply([...(history || []), { role: "user", content: message }]);

  await prisma.chatMessage.createMany({
    data: [
      { userId, role: "user", content: message },
      { userId, role: "assistant", content: reply },
    ],
  });

  return NextResponse.json({ reply });
}

