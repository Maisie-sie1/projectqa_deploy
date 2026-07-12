import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
    email: z.string().email("อีเมลไม่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const bookSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อหนังสือ"),
  author: z.string().min(1, "กรุณากรอกชื่อผู้แต่ง"),
  description: z.string().optional(),
  price: z.coerce.number().positive("ราคาต้องมากกว่า 0"),
  originalPrice: z.coerce.number().positive().optional().or(z.literal("")),
  categoryId: z.coerce.number().positive("กรุณาเลือกหมวดหมู่"),
  stock: z.coerce.number().int().min(0, "จำนวนสต็อกต้องไม่ติดลบ"),
  isBestSeller: z.coerce.boolean().optional(),
});

export const shippingSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  city: z.string().min(1, "กรุณากรอกเขต/อำเภอ"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  postalCode: z.string().min(5, "รหัสไปรษณีย์ไม่ถูกต้อง"),
  phone: z.string().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
});
