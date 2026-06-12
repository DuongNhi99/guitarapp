/**
 * Migrates all JPG images from D:/ABBA2026/Musicsongs/ to Supabase.
 * Run: node --env-file=.env.local scripts/migrate-images.mjs
 */

import { readFileSync, readdirSync } from "fs";
import { join, basename, extname } from "path";

const PROJECT_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMAGE_DIR = "D:/ABBA2026/Musicsongs";

if (!PROJECT_URL || !SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1);
}

const AUTH = { "Authorization": `Bearer ${SERVICE_KEY}`, "apikey": SERVICE_KEY };

const TITLES = {
  "ai-chung-tinh-duoc-mai": "Ai Chung Tình Được Mãi",
  "ai-kho-vi-ai": "Ai Khổ Vì Ai",
  "bac-trang-tinh-doi": "Bạc Trắng Tình Đời",
  "bai-khong-ten-so-7": "Bài Không Tên Số 7",
  "ban-tinh-cuoi": "Bản Tình Cuối",
  "boi-bac": "Bội Bạc",
  "bong-dien-dien": "Bông Điên Điển",
  "can-nha-mau-tim": "Căn Nhà Màu Tím",
  "chi-co-em": "Chỉ Có Em",
  "chiec-la-cuoi-cung": "Chiếc Lá Cuối Cùng",
  "chiec-vong-cau-hon": "Chiếc Vòng Cầu Hôn",
  "chieu-ha-vang": "Chiều Hạ Vàng",
  "chieu-san-ga": "Chiều Sân Ga",
  "chuyen-ba-nguoi": "Chuyện Ba Người",
  "chuyen-gian-thien-ly": "Chuyện Giàn Thiên Lý",
  "chuyen-tinh-lan-va-diep": "Chuyện Tình Lan Và Điệp",
  "con-duong-xua-em-di": "Con Đường Xưa Em Đi",
  "dap-mo-cuoc-tinh": "Đắp Mộ Cuộc Tình",
  "dem-buon-tinh-le": "Đêm Buồn Tỉnh Lẻ",
  "dem-dai-chien-tuyen": "Đêm Dài Chiến Tuyến",
  "doan-tai-but": "Đoạn Tái Bút",
  "doi-mat-nguoi-xua": "Đôi Mắt Người Xưa",
  "doi-nga-chia-ly": "Đôi Ngả Chia Ly",
  "duyen-phan": "Duyên Phận",
  "hai-vi-sao-lac": "Hai Vì Sao Lạc",
  "hat-nua-di-em": "Hát Nữa Đi Em",
  "huong-dong-gio-noi": "Hương Đồng Gió Nội",
  "huong-toc-ma-non": "Hương Tóc Mạ Non",
  "ke-o-mien-xa": "Kẻ Ở Miền Xa",
  "khong-gio-roi": "Không Giờ Rồi",
  "linh-hon-tuong-da": "Linh Hồn Tượng Đá",
  "mot-mai-gia-tu-vu-khi": "Một Mai Giã Từ Vũ Khí",
  "muoi-nam-tinh-cu": "Mười Năm Tình Cũ",
  "nguoi-tinh-khong-den": "Người Tình Không Đến",
  "nhat-ky-doi-toi": "Nhật Ký Đời Tôi",
  "nho-nguoi-yeu": "Nhớ Người Yêu",
  "rung-la-thap": "Rừng Lá Thấp",
  "tau-anh-qua-nui": "Tàu Anh Qua Núi",
  "thuong-hoai-ngan-nam": "Thương Hoài Ngàn Năm",
  "thuong-nhau-ly-to-hong": "Thương Nhau Lý Tơ Hồng",
  "thuong-ve-mien-trung": "Thương Về Miền Trung",
  "tieng-hat-chim-da-da": "Tiếng Hát Chim Đa Đa",
  "tinh-doi": "Tình Đời",
  "tinh-em-bien-rong-song-dai": "Tình Em Biển Rộng Sông Dài",
  "tinh-tham-duyen-qua": "Tình Thầm Duyên Qua",
  "tinh-yeu-tra-lai-trang-sao": "Tình Yêu Trả Lại Trăng Sao",
  "to-hong": "Tơ Hồng",
  "toi-dua-em-sang-song": "Tôi Đưa Em Sang Sông",
  "toi-tinh": "Tội Tình",
  "toi-van-nho": "Tôi Vẫn Nhớ",
  "trach-ai-vo-tinh": "Trách Ai Vô Tình",
  "tren-bon-vung-chien-thuat": "Trên Bốn Vùng Chiến Thuật",
  "ve-mien-tay": "Về Miền Tây",
  "vet-thu-tren-lung-nghua-hoang": "Vết Thù Trên Lưng Ngựa Hoang",
  "vong-nhan-cuoi": "Vòng Nhẫn Cưới",
  "xa-roi-mua-dong": "Xa Rồi Mùa Đông",
  "xe-mo-ngay-cu": "Xe Mò Ngày Cũ",
  "xin-con-goi-ten-nhau": "Xin Còn Gọi Tên Nhau",
  "xin-goi-nhau-la-co-nhan": "Xin Gọi Nhau Là Cố Nhân",
  "xin-lam-nguoi-xa-la": "Xin Làm Người Xa Lạ",
  "xom-dem": "Xóm Đêm",
};

async function run() {
  const files = readdirSync(IMAGE_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images. Uploading...\n`);

  let ok = 0, fail = 0;

  for (const file of files) {
    const slug = basename(file, extname(file));
    const title = TITLES[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const buffer = readFileSync(join(IMAGE_DIR, file));

    // Upload to Storage
    const uploadRes = await fetch(
      `${PROJECT_URL}/storage/v1/object/sheets/${file}`,
      { method: "POST", headers: { ...AUTH, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: buffer }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error(`  ✗ ${file}: ${err}`);
      fail++; continue;
    }

    const image_url = `${PROJECT_URL}/storage/v1/object/public/sheets/${file}`;

    // Insert into DB
    const dbRes = await fetch(`${PROJECT_URL}/rest/v1/sheet_images`, {
      method: "POST",
      headers: { ...AUTH, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ title, slug, image_url }),
    });

    if (dbRes.ok || dbRes.status === 201) {
      console.log(`  ✓ ${title}`);
      ok++;
    } else {
      const err = await dbRes.text();
      console.error(`  ✗ ${file} (db): ${err}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} uploaded, ${fail} failed.`);
}

run().catch(console.error);
