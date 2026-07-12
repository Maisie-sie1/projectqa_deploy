import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. Create Admin User
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const [admin] = await db
    .insert(schema.users)
    .values({
      name: "Admin Lumina",
      email: "admin@lumina.com",
      password: hashedPassword,
      role: "admin",
    })
    .returning();
  console.log("Admin created:", admin.email);

  // 2. Create Categories
  console.log("Creating categories...");
  const categoriesData = [
    { name: "นวนิยาย", slug: "fiction", icon: "auto_stories", description: "นวนิยายและเรื่องแต่งที่น่าตื่นเต้น" },
    { name: "สารคดี", slug: "non-fiction", icon: "import_contacts", description: "หนังสือเชิงข้อเท็จจริงและความรู้" },
    { name: "ธุรกิจ", slug: "business", icon: "work", description: "ความรู้ด้านธุรกิจ การลงทุน และการจัดการ" },
    { name: "ศิลปะ", slug: "art", icon: "palette", description: "หนังสือเกี่ยวกับศิลปะและการออกแบบ" },
  ];
  
  const createdCategories = await db.insert(schema.categories).values(categoriesData).returning();

  // Helper to fetch Unsplash image as base64
  async function fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch (e) {
      console.error("Failed to fetch image:", url, e);
      return "";
    }
  }

  // 3. Create Books
  console.log("Creating books (this might take a while to download images)...");
  
  const booksData = [
    {
      title: "ความลับแห่งแสงจันทร์",
      author: "พลอยใส รัตนกุล",
      description: "เมื่อแสงจันทร์นำพาสองหัวใจมาพบกันในค่ำคืนที่แสนยาวนาน นวนิยายโรแมนติกแฟนตาซีที่ครองใจผู้อ่านทั่วประเทศ",
      price: 350,
      originalPrice: 400,
      categoryId: createdCategories.find(c => c.slug === "fiction")?.id,
      stock: 50,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 125,
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "เศรษฐศาสตร์เปลี่ยนโลก",
      author: "ดร. สมชาย มั่งคั่ง",
      description: "ทำความเข้าใจว่าเศรษฐศาสตร์ทำงานอย่างไร และมันส่งผลต่อชีวิตประจำวันของเราในยุคดิจิทัลอย่างไรบ้าง",
      price: 450,
      originalPrice: null,
      categoryId: createdCategories.find(c => c.slug === "business")?.id,
      stock: 30,
      isBestSeller: true,
      rating: 4.5,
      reviewCount: 89,
      imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "ศิลปะแห่งการปล่อยวาง",
      author: "พศิน อินทสรวง",
      description: "เรียนรู้วิธีจัดการกับความเครียดและปล่อยวางจากสิ่งที่ควบคุมไม่ได้ เพื่อชีวิตที่มีความสุขและสงบมากขึ้น",
      price: 280,
      originalPrice: 320,
      categoryId: createdCategories.find(c => c.slug === "non-fiction")?.id,
      stock: 100,
      isBestSeller: false,
      rating: 4.9,
      reviewCount: 240,
      imageUrl: "https://images.unsplash.com/photo-1499540633125-484965b60031?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "การออกแบบเพื่อผู้คน",
      author: "วิจิตร ดีไซน์",
      description: "หลักการออกแบบ User Experience ที่เน้นมนุษย์เป็นศูนย์กลาง สำหรับนักออกแบบรุ่นใหม่",
      price: 650,
      originalPrice: null,
      categoryId: createdCategories.find(c => c.slug === "art")?.id,
      stock: 15,
      isBestSeller: false,
      rating: 4.2,
      reviewCount: 45,
      imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "ปริศนาฆาตกรรมเงา",
      author: "กิตติ ภักดี",
      description: "คดีฆาตกรรมในห้องปิดตายที่แม้แต่นักสืบที่เก่งที่สุดยังต้องกุมขมับ หักมุมจนหน้าสุดท้าย",
      price: 320,
      originalPrice: 350,
      categoryId: createdCategories.find(c => c.slug === "fiction")?.id,
      stock: 45,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 156,
      imageUrl: "https://images.unsplash.com/photo-1629196914264-a78b54e3d3f1?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "ประวัติศาสตร์จักรวาล",
      author: "นพ. ดารา นพมาศ",
      description: "ย้อนรอยตั้งแต่อดีตกาลจนถึงปัจจุบัน เรามาจากไหนและกำลังจะไปที่ใด สรุปเข้าใจง่าย",
      price: 550,
      originalPrice: 600,
      categoryId: createdCategories.find(c => c.slug === "non-fiction")?.id,
      stock: 20,
      isBestSeller: false,
      rating: 4.6,
      reviewCount: 78,
      imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "ลงทุนเพื่ออิสรภาพ",
      author: "ศิริชัย พารวย",
      description: "คู่มือการลงทุนหุ้นสำหรับมือใหม่ ปูพื้นฐานสู่ความมั่งคั่งอย่างยั่งยืน",
      price: 390,
      originalPrice: null,
      categoryId: createdCategories.find(c => c.slug === "business")?.id,
      stock: 80,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 312,
      imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop",
    }
  ];

  for (const bookData of booksData) {
    console.log(`Processing book: ${bookData.title}`);
    const base64Cover = await fetchImageAsBase64(bookData.imageUrl);
    
    await db.insert(schema.books).values({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: bookData.price,
      originalPrice: bookData.originalPrice,
      categoryId: bookData.categoryId,
      stock: bookData.stock,
      isBestSeller: bookData.isBestSeller,
      rating: bookData.rating,
      reviewCount: bookData.reviewCount,
      coverImage: base64Cover,
    });
  }

  console.log("Seeding complete!");
}

seed().catch((e) => {
  console.error("Seeding failed", e);
  process.exit(1);
});
