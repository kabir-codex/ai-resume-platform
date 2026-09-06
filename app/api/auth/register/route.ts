import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateRequest, registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateRequest(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        subscription: { create: { plan: "FREE", status: "active" } },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}

