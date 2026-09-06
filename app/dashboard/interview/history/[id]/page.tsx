import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InterviewDetail from "./InterviewDetail";

interface Props {
  params: Promise<{ id: string }>;
}

interface InterviewWithParsedQuestions {
  id: string;
  role: string;
  questions: { question: string; type: string; tip: string }[];
  createdAt: Date;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return { title: "Interview Questions" };

  const interview = await prisma.interviewSet.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!interview) return { title: "Interview Not Found" };

  return { title: `${interview.role} — Interview Questions` };
}

export default async function InterviewHistoryDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const interview = await prisma.interviewSet.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!interview) redirect("/dashboard/interview/history");

  const parsedInterview: InterviewWithParsedQuestions = {
    ...interview,
    questions: JSON.parse(interview.questions),
  };

  return <InterviewDetail interview={parsedInterview} />;
}