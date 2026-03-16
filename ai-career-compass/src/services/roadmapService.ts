import { careerAPI } from './api';

export interface RoadmapStep {
  step_number: number;
  title: string;
  description: string;
}

export interface RoadmapData {
  career: string;
  roadmap: RoadmapStep[];
}

export interface RoadmapResponse {
  success: boolean;
  data?: RoadmapData;
  error?: string;
  cached?: boolean;
}

export class RoadmapService {
  private cache = new Map<string, { data: RoadmapData; timestamp: number }>();
  private cacheTTL = 24 * 60 * 60 * 1000;

  private getCacheKey(career: string, level: string): string {
    return `roadmap_${career}_${level}`;
  }

  async generateRoadmap(career: string, level: string = 'beginner'): Promise<RoadmapResponse> {
    try {
      const cacheKey = this.getCacheKey(career, level);
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return { success: true, data: cached.data, cached: true };
      }

      const data: RoadmapData = await careerAPI.generateRoadmapByTitle(career, level);

      if (!data || !Array.isArray(data.roadmap)) {
        throw new Error('Invalid roadmap response from server');
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return { success: true, data, cached: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap';
      console.error('Roadmap generation failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const roadmapService = new RoadmapService();
