import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
        reviews: true
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
      }))
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch heritages' });
  }
});

// Create Heritage
app.post('/api/heritages', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newHeritage = await prisma.heritage.create({
      data: {
        slugId: data.id || `loc-${Date.now()}`,
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
        imageUrl: data.image,
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
    res.status(500).json({ error: 'Failed to create heritage' });
  }
});

// Update Heritage
app.put('/api/heritages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
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
        imageUrl: data.image,
        description: data.description,
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update heritage' });
  }
});

// Delete Heritage
app.delete('/api/heritages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.heritage.delete({ where: { slugId: id } });
    res.json({ success: true });
  } catch (error) {
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

// Create Remedy
app.post('/api/remedies', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newRemedy = await prisma.remedy.create({
      data: {
        slugId: data.id || `rem-${Date.now()}`,
        name: data.name,
        category: data.category,
        ingredients: JSON.stringify(data.ingredients || []),
        benefits: data.benefits,
        keywords: JSON.stringify(data.keywords || []),
        usage: data.usage,
        imageEmoji: data.image,
        steps: JSON.stringify(data.steps || []),
        imageUrl: data.imageUrl,
      }
    });
    res.json(newRemedy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create remedy' });
  }
});

// Update Remedy
app.put('/api/remedies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.remedy.update({
      where: { slugId: id },
      data: {
        name: data.name,
        category: data.category,
        ingredients: JSON.stringify(data.ingredients || []),
        benefits: data.benefits,
        usage: data.usage,
        steps: JSON.stringify(data.steps || []),
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update remedy' });
  }
});

// Delete Remedy
app.delete('/api/remedies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.remedy.delete({ where: { slugId: id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete remedy' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
