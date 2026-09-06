import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResumeDetail from "./ResumeDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return { title: "Resume Analysis" };

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: { analysis: true },
  });

  if (!resume) return { title: "Resume Not Found" };

  return { title: `${resume.fileName} — Resume Analysis` };
}

export default async function ResumeHistoryDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    include: { analysis: true },
  });

  if (!resume) redirect("/dashboard/resume/history");

  // Transform for client component - parse JSON strings and convert dates
  const clientResume = {
    ...resume,
    createdAt: resume.createdAt.toISOString(),
    analysis: resume.analysis ? {
      ...resume.analysis,
      createdAt: resume.analysis.createdAt.toISOString(),
      strengths: JSON.parse(resume.analysis.strengths),
      weaknesses: JSON.parse(resume.analysis.weaknesses),
      suggestions: JSON.parse(resume.analysis.suggestions),
      extractedSkills: JSON.parse(resume.analysis.extractedSkills),
    } : null,
  };

  return <ResumeDetail resume={clientResume} />;
}