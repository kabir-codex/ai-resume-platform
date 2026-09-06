import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions } from "@/lib/openai";
import { aiRateLimiter } from "@/lib/middleware/rate-limiter";
import { validateRequest, interviewSchema } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const interviews = await prisma.interviewSet.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    interviews: interviews.map((i) => ({
      id: i.id,
      role: i.role,
      questions: JSON.parse(i.questions),
      createdAt: i.createdAt,
    })),
  });
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
  const validation = validateRequest(interviewSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { role, resumeId } = validation.data;

  let resumeText: string | undefined;
  if (resumeId) {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    resumeText = resume?.rawText;
  }

  const result = await generateInterviewQuestions(role, resumeText);

  await prisma.interviewSet.create({
    data: { userId, role, questions: JSON.stringify(result.questions) },
  });

  return NextResponse.json(result);
}

