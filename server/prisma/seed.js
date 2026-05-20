const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  // Clean up existing data to avoid duplicates
  await prisma.review.deleteMany();
  await prisma.remedy.deleteMany();
  await prisma.heritage.deleteMany();
  
  // 1. Read heritageData.ts
  const heritageContent = fs.readFileSync(path.join(__dirname, '../../src/app/heritageData.ts'), 'utf-8');
  const heritageMatch = heritageContent.match(/export const HERITAGE_LOCATIONS: HeritageLocation\[\] = (\[[\s\S]*?\]);/);
  
  let heritages = [];
  if (heritageMatch) {
    const rawCode = heritageMatch[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
    // Using eval because it contains JS objects, not strictly JSON (e.g. trailing commas, missing quotes on keys)
    heritages = eval('(' + heritageMatch[1] + ')');
  }

  // 2. Read data.ts
  const dataContent = fs.readFileSync(path.join(__dirname, '../../src/app/data.ts'), 'utf-8');
  const remedyMatch = dataContent.match(/export const traditionalRemedies = (\[[\s\S]*?\]);/);
  
  let remedies = [];
  if (remedyMatch) {
     // eval won't work easily if there are variables like `traLaSenMatOngImage`. 
     // We can just replace those variables with their names as strings
     let code = remedyMatch[1].replace(/imageUrl: ([a-zA-Z]+)/g, 'imageUrl: "$1"');
     remedies = eval('(' + code + ')');
  }
  
  // Seed Heritages
  for (const h of heritages) {
    const createdHeritage = await prisma.heritage.create({
      data: {
        slugId: h.id,
        name: h.name,
        address: h.address,
        latitude: h.position[0],
        longitude: h.position[1],
        status: h.status,
        level: h.level,
        herbs: JSON.stringify(h.herbs || []),
        regulations: h.regulations,
        category: h.type,
        color: h.color,
        imageUrl: h.image,
        aqi: h.aqi,
        humidity: h.humidity,
        medicinalPower: h.medicinalPower,
        rating: h.rating,
        folkTip: h.folkTip,
        reviewsCount: h.reviews,
        description: h.description,
        history: h.history,
        bestTime: h.bestTime,
        contact: h.contact,
        
        // Seed reviews alongside heritage
        reviews: {
          create: (h.comments || []).map(c => ({
            guestName: c.user,
            comment: c.text,
            rating: c.rating
          }))
        }
      }
    });
    console.log(`Created heritage: ${h.name}`);
  }
  
  // Ánh xạ liên kết bài thuốc với di sản dược liệu tương thích dựa trên thực địa tự nhiên
  const remedyToHeritageMap = {
    'tra-la-sen': 'loc-11',       // Bảo Tàng Di Sản Đồng Đình (đầm sen rừng tự nhiên)
    'siro-la-lot': 'loc-2',       // Làng Nghề Thuốc Nam Túy Loan (trồng lá lốt nhiều)
    'canh-kho-qua': 'loc-12',     // Khu Sinh Thái Thảo Mộc Nam Ô (mướp đắng rừng)
    'nuoc-gung': 'loc-7',         // Vùng Nguyên Liệu Cẩm Lệ (gừng tươi ven sông)
    'xong-hoi': 'loc-7',          // Vùng Nguyên Liệu Cẩm Lệ (sả, chanh, bạc hà)
    'tra-hoa-cuc': 'loc-10',      // Phố Đông Y Ông Ích Khiêm (nổi tiếng trà hoa cúc)
    'tra-atiso': 'loc-5',         // Vườn Thảo Mộc Trung Tâm Hải Châu (atiso đỏ Hải Châu)
    'ngam-chan-ngai-cuu': 'loc-3', // Trạm Dược Liệu Ngũ Hành Sơn (ngải cứu kẽ đá)
    'nuoc-tia-to': 'loc-2',       // Làng Nghề Thuốc Nam Túy Loan (tía tô Túy Loan)
    'che-vang': 'loc-1',          // Khu Bảo Tồn Thiên Nhiên Sơn Trà (chè dây, chè vằng quý Sơn Trà)
    'toi-ngam-mat-ong': 'loc-7',  // Vùng Nguyên Liệu Cẩm Lệ
    'nuoc-dau-den': 'loc-7',      // Vùng Nguyên Liệu Cẩm Lệ
    'nha-dam-duong-phen': 'loc-7', // Vùng Nguyên Liệu Cẩm Lệ
    'nuoc-rau-ma': 'loc-7',       // Vùng Nguyên Liệu Cẩm Lệ
    'tra-gung-duong-den': 'loc-10', // Phố Đông Y Ông Ích Khiêm
    'chao-tia-to': 'loc-12',      // Khu Sinh Thái Thảo Mộc Nam Ô
    'nuoc-sa-chanh': 'loc-7',     // Vùng Nguyên Liệu Cẩm Lệ
    'tra-tam-sen': 'loc-11',      // Bảo Tàng Di Sản Đồng Đình
    'nuoc-voi-tuoi': 'loc-2',     // Làng Nghề Thuốc Nam Túy Loan
    'tra-gung-mat-ong': 'loc-10', // Phố Đông Y Ông Ích Khiêm
    'nuoc-dau-van-rang': 'loc-7',  // Vùng Nguyên Liệu Cẩm Lệ
    'canh-bi-dao': 'loc-7',       // Vùng Nguyên Liệu Cẩm Lệ
    'nuoc-ep-diep-ca': 'loc-7',    // Vùng Nguyên Liệu Cẩm Lệ
    'che-hat-sen-long-nhan': 'loc-11', // Bảo Tàng Di Sản Đồng Đình
    'sua-gao-lut-rang': 'loc-7',   // Vùng Nguyên Liệu Cẩm Lệ
    'chanh-dao-mat-ong': 'loc-7'   // Vùng Nguyên Liệu Cẩm Lệ
  };

  // Seed Remedies
  for (const r of remedies) {
    const heritageSlug = remedyToHeritageMap[r.id];
    let heritageId = null;

    if (heritageSlug) {
      const dbHeritage = await prisma.heritage.findUnique({
        where: { slugId: heritageSlug }
      });
      if (dbHeritage) {
        heritageId = dbHeritage.id;
      }
    }

    await prisma.remedy.create({
      data: {
        slugId: r.id,
        heritageId: heritageId,
        name: r.name,
        category: r.category,
        ingredients: JSON.stringify(r.ingredients || []),
        benefits: r.benefits,
        keywords: JSON.stringify(r.keywords || []),
        usage: r.usage,
        imageEmoji: r.image,
        steps: JSON.stringify(r.steps || []),
        imageUrl: typeof r.imageUrl === 'string' && r.imageUrl.startsWith('/') ? r.imageUrl : `/images/${r.id}.jpg`,
      }
    });
    console.log(`Created remedy: ${r.name} linked to heritageId: ${heritageId}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
