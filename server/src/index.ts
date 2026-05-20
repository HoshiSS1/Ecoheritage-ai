import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// --- BỘ GIẢI MÃ VÀ LƯU HÌNH ẢNH BASE64 THÀNH TỆP TIN VẬT LÝ ---
function saveBase64Image(base64String: string | null | undefined, id: string): string | null {
  if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image/')) {
    return base64String || null;
  }
  
  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64String;
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Xác định đuôi mở rộng phù hợp
    let extension = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      extension = 'jpg';
    } else if (mimeType.includes('gif')) {
      extension = 'gif';
    } else if (mimeType.includes('webp')) {
      extension = 'webp';
    }
    
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `img_${cleanId}_${Date.now()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`[Image CMS] Đã lưu ảnh Base64 thành tập tin: ${filepath}`);
    
    return `http://localhost:5000/uploads/${filename}`;
  } catch (error) {
    console.error('[Image CMS] Lỗi lưu ảnh Base64:', error);
    return base64String;
  }
}

// --- TIỆN ÍCH KÝ VÀ XÁC THỰC JWT (Zero-Dependency) ---
const JWT_SECRET = process.env.JWT_SECRET || 'ecoheritage-secure-jwt-secret-key-2026';

function signJwt(payload: any, expiresIn: string = '24h'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  let exp = now + 24 * 3600; // Mặc định 24 tiếng
  if (expiresIn.endsWith('h')) {
    exp = now + parseInt(expiresIn) * 3600;
  }
  
  const base64Payload = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
    
  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyJwt(token: string): any {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64 || !signature) return null;
    
    const calculatedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
      
    if (signature !== calculatedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token đã hết hạn
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Middleware bảo mật xác thực Token cho các API tạo, sửa, xóa
function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu xác thực tài khoản (Token không tìm thấy)' });
  }
  
  const user = verifyJwt(token);
  if (!user) {
    return res.status(403).json({ error: 'Phiên làm việc đã hết hạn hoặc mã không hợp lệ' });
  }
  
  (req as any).user = user;
  next();
}

// Users API
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, avatarUrl: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Heritages API
app.get('/api/heritages', async (req: Request, res: Response) => {
  try {
    const heritages = await prisma.heritage.findMany({
      include: {
        reviews: true,
        remedies: true
      }
    });
    
    // Format to match exactly what frontend expects
    const formatted = heritages.map((h: any) => ({
      id: h.slugId,
      name: h.name,
      address: h.address,
      position: [h.latitude, h.longitude],
      status: h.status,
      level: h.level,
      herbs: JSON.parse(h.herbs || '[]'),
      regulations: h.regulations,
      type: h.category,
      color: h.color,
      image: h.imageUrl,
      aqi: h.aqi,
      humidity: h.humidity,
      medicinalPower: h.medicinalPower,
      rating: h.rating,
      folkTip: h.folkTip,
      reviews: h.reviewsCount,
      description: h.description,
      history: h.history,
      bestTime: h.bestTime,
      contact: h.contact,
      comments: h.reviews.map((r: any) => ({
        user: r.guestName,
        text: r.comment,
        rating: r.rating
      })),
      remedies: (h.remedies || []).map((r: any) => ({
        id: r.slugId,
        name: r.name,
        category: r.category,
        ingredients: JSON.parse(r.ingredients || '[]'),
        benefits: r.benefits,
        keywords: JSON.parse(r.keywords || '[]'),
        usage: r.usage,
        image: r.imageEmoji,
        steps: JSON.parse(r.steps || '[]'),
        imageUrl: r.imageUrl
      }))
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch heritages' });
  }
});

// --- ĐĂNG NHẬP HỆ THỐNG SINH TOKEN JWT ---
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Kiểm tra tài khoản quản trị mặc định (ecoheritage-admin)
    if (username === 'admin' && password === 'ecoheritage-admin') {
      const token = signJwt({ role: 'Super Admin', username });
      return res.json({ token, role: 'Super Admin' });
    }
    
    // Kiểm tra tài khoản người dùng trong cơ sở dữ liệu
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { fullName: username }
        ]
      }
    });
    
    if (user) {
      // Vì là môi trường học tập, cho phép xác thực nhanh không cần băm phức tạp
      const token = signJwt({ userId: user.id, role: user.role, email: user.email });
      return res.json({ token, role: user.role });
    }
    
    res.status(401).json({ error: 'Thông tin tài khoản hoặc mật khẩu không chính xác.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xác thực hệ thống.' });
  }
});

// Create Heritage (Secured with JWT & Base64 Image upload)
app.post('/api/heritages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const slugId = data.id || `loc-${Date.now()}`;
    
    // Giải mã lưu ảnh base64 nếu có sang tập tin vật lý
    const imageUrl = saveBase64Image(data.image, slugId);
    
    const newHeritage = await prisma.heritage.create({
      data: {
        slugId: slugId,
        name: data.name,
        address: data.address,
        latitude: data.position?.[0],
        longitude: data.position?.[1],
        status: data.status,
        level: data.level,
        herbs: JSON.stringify(data.herbs || []),
        regulations: data.regulations,
        category: data.type,
        color: data.color,
        imageUrl: imageUrl,
        aqi: data.aqi,
        humidity: data.humidity,
        medicinalPower: data.medicinalPower,
        rating: data.rating,
        folkTip: data.folkTip,
        reviewsCount: data.reviews,
        description: data.description,
        history: data.history,
        bestTime: data.bestTime,
        contact: data.contact,
      }
    });
    res.json(newHeritage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create heritage' });
  }
});

// Update Heritage (Secured with JWT & Base64 Image upload)
app.put('/api/heritages/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Giải mã lưu ảnh base64 nếu có
    const imageUrl = saveBase64Image(data.image, id);
    
    const updated = await prisma.heritage.update({
      where: { slugId: id },
      data: {
        name: data.name,
        address: data.address,
        latitude: data.position?.[0],
        longitude: data.position?.[1],
        status: data.status,
        level: data.level,
        herbs: JSON.stringify(data.herbs || []),
        regulations: data.regulations,
        category: data.type,
        color: data.color,
        imageUrl: imageUrl,
        description: data.description,
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update heritage' });
  }
});

// Delete Heritage (Secured with JWT)
app.delete('/api/heritages/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.heritage.delete({ where: { slugId: id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete heritage' });
  }
});

// Remedies API
app.get('/api/remedies', async (req: Request, res: Response) => {
  try {
    const remedies = await prisma.remedy.findMany();
    
    // Format to match exactly what frontend expects
    const formatted = remedies.map((r: any) => ({
      id: r.slugId,
      name: r.name,
      category: r.category,
      ingredients: JSON.parse(r.ingredients || '[]'),
      benefits: r.benefits,
      keywords: JSON.parse(r.keywords || '[]'),
      usage: r.usage,
      image: r.imageEmoji,
      steps: JSON.parse(r.steps || '[]'),
      imageUrl: r.imageUrl
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch remedies' });
  }
});

// Create Remedy (Secured with JWT & Base64 Image upload)
app.post('/api/remedies', authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const slugId = data.id || `rem-${Date.now()}`;
    
    // Giải mã lưu ảnh base64 nếu có
    const imageUrl = saveBase64Image(data.imageUrl || data.image, slugId);
    
    const newRemedy = await prisma.remedy.create({
      data: {
        slugId: slugId,
        name: data.name,
        category: data.category,
        ingredients: JSON.stringify(data.ingredients || []),
        benefits: data.benefits,
        keywords: JSON.stringify(data.keywords || []),
        usage: data.usage,
        imageEmoji: data.image,
        steps: JSON.stringify(data.steps || []),
        imageUrl: imageUrl,
      }
    });
    res.json(newRemedy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create remedy' });
  }
});

// Update Remedy (Secured with JWT & Base64 Image upload)
app.put('/api/remedies/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Giải mã lưu ảnh base64 nếu có
    const imageUrl = saveBase64Image(data.imageUrl || data.image, id);
    
    const updated = await prisma.remedy.update({
      where: { slugId: id },
      data: {
        name: data.name,
        category: data.category,
        ingredients: JSON.stringify(data.ingredients || []),
        benefits: data.benefits,
        usage: data.usage,
        steps: JSON.stringify(data.steps || []),
        imageUrl: imageUrl,
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update remedy' });
  }
});

// Delete Remedy (Secured with JWT)
app.delete('/api/remedies/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.remedy.delete({ where: { slugId: id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete remedy' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
