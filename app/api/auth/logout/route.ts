import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteSession();
    return Response.json({
      success: true,
      message: "ออกจากระบบสำเร็จ",
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการออกจากระบบ" }, { status: 500 });
  }
}
