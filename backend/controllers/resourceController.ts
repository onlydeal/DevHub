// backend/controllers/resourceController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import { redisClient } from '../config/redis';

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  const cacheKey = 'github_trending';
  try {
    let data = await redisClient.get(cacheKey);
    if (data) {
      res.json(JSON.parse(data));
      return;
    }

    // Mock trending data since RapidAPI key might not be available
    const mockData = [
      { name: 'react', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.', stars: 200000 },
      { name: 'vue', description: 'Vue.js - The Progressive JavaScript Framework', stars: 190000 },
      { name: 'angular', description: 'The modern web developer\'s platform', stars: 85000 },
      { name: 'svelte', description: 'Cybernetically enhanced web apps', stars: 70000 },
      { name: 'next.js', description: 'The React Framework for Production', stars: 110000 }
    ];
    
    data = JSON.stringify(response.data);
    await redisClient.setEx(cacheKey, 600, data);
    res.json(mockData);
  } catch (err) {
    res.status(500).json({ msg: 'API error' });
  }
};