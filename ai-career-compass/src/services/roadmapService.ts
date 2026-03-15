import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY_STUDY_PLANS;
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const geminiAI = GEMINI_KEY && !GEMINI_KEY.includes('your_') ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const anthropic = ANTHROPIC_KEY && !ANTHROPIC_KEY.includes('your_') ? new Anthropic({ apiKey: ANTHROPIC_KEY, dangerouslyAllowBrowser: true }) : null;
const openai = OPENAI_KEY && !OPENAI_KEY.includes('your_') ? new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true }) : null;

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

  private createPrompt(career: string, level: string): string {
    return `Generate 6 milestones for ${career} at ${level} level.
Return valid JSON only:
{"career":"${career}","roadmap":[{"step_number":1,"title":"Learn Basics","description":"Start with fundamentals"},{"step_number":2,"title":"Build Foundation","description":"Master core concepts"},{"step_number":3,"title":"Practice Skills","description":"Apply knowledge through projects"},{"step_number":4,"title":"Advanced Topics","description":"Explore complex areas"},{"step_number":5,"title":"Real Projects","description":"Build portfolio pieces"},{"step_number":6,"title":"Job Ready","description":"Prepare for career"}]}
Replace titles and descriptions for ${career}. Keep descriptions under 15 words.`;
  }

  private parseJSON(text: string): RoadmapData {
    try {
      let cleaned = text.trim();
      
      // Remove markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }

      // Extract JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Aggressive JSON cleanup
      cleaned = cleaned
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/"\s*:\s*"/g, '":"') // Normalize key-value spacing
        .replace(/,\s*}/g, '}') // Remove trailing comma before }
        .replace(/,\s*]/g, ']'); // Remove trailing comma before ]

      // Try to parse
      let parsed = JSON.parse(cleaned);
      
      // Validate structure
      if (!parsed.career || !Array.isArray(parsed.roadmap)) {
        throw new Error('Invalid roadmap structure');
      }

      // Ensure all steps have required fields
      parsed.roadmap = parsed.roadmap.map((step: any, index: number) => ({
        step_number: step.step_number || index + 1,
        title: step.title || 'Untitled Step',
        description: step.description || 'No description'
      }));

      return parsed;
    } catch (error) {
      console.error('Failed to parse roadmap JSON:', error);
      console.log('Raw text:', text.substring(0, 1000));
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWithGemini(career: string, level: string): Promise<RoadmapData> {
    if (!geminiAI) throw new Error('Gemini API key not configured');

    const model = geminiAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(this.createPrompt(career, level));
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async generateWithClaude(career: string, level: string): Promise<RoadmapData> {
    if (!anthropic) throw new Error('Anthropic API key not configured');

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 800,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: this.createPrompt(career, level)
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return this.parseJSON(content.text);
  }

  async generateWithOpenAI(career: string, level: string): Promise<RoadmapData> {
    if (!openai) throw new Error('OpenAI API key not configured');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: this.createPrompt(career, level)
      }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return this.parseJSON(content);
  }

  async generateRoadmap(career: string, level: string = 'beginner'): Promise<RoadmapResponse> {
    try {
      const cacheKey = this.getCacheKey(career, level);
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return {
          success: true,
          data: cached.data,
          cached: true
        };
      }

      let lastError: Error | null = null;

      if (geminiAI) {
        try {
          const data = await this.generateWithGemini(career, level);
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          return { success: true, data, cached: false };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Gemini failed');
          console.warn('Gemini failed, trying Claude:', lastError);
        }
      }

      if (anthropic) {
        try {
          const data = await this.generateWithClaude(career, level);
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          return { success: true, data, cached: false };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Claude failed');
          console.warn('Claude failed, trying OpenAI:', lastError);
        }
      }

      if (openai) {
        try {
          const data = await this.generateWithOpenAI(career, level);
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          return { success: true, data, cached: false };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('OpenAI failed');
        }
      }

      if (lastError) throw lastError;
      throw new Error('No AI API keys configured');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Roadmap generation failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const roadmapService = new RoadmapService();
