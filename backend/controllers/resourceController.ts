// backend/controllers/resourceController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URI });
client.connect();

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  const cacheKey = 'github_trending';
  try {
    let data = await client.get(cacheKey);
    if (data) {
      res.json(JSON.parse(data));
      return;
    }

    const response = await axios.get('https://github-trending.p.rapidapi.com/repositories', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY as string,
        'x-rapidapi-host': 'github-trending.p.rapidapi.com'
      }
    });
    data = JSON.stringify(response.data);
    await client.setEx(cacheKey, 600, data);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'API error' });
  }
};