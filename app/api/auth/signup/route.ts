import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ fieldErrors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = result.data;

    // Check existing user
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "member",
      })
      .returning({ id: users.id, role: users.role });

    await createSession(newUser.id, newUser.role);

    return Response.json({
      success: true,
      message: "ลงทะเบียนสมาชิกสำเร็จ",
      user: {
        id: newUser.id,
        name,
        email,
        role: newUser.role,
      },
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการลงทะเบียน" }, { status: 500 });
  }
}
