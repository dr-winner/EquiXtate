import axios from 'axios';

interface AIResponse {
  response: string;
  error?: string;
}

class AIProxyService {
  private static instance: AIProxyService;
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly rateLimiter: Map<string, number[]> = new Map();
  private readonly RATE_LIMIT = 10; // requests per minute
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

  private constructor() {
    this.baseURL = import.meta.env.VITE_AI_API_BASE_URL;
    this.apiKey = import.meta.env.VITE_AI_API_KEY;
    
    if (!this.baseURL || !this.apiKey) {
      throw new Error('AI API configuration is missing. Please check your environment variables.');
    }
  }

  public static getInstance(): AIProxyService {
    if (!AIProxyService.instance) {
      AIProxyService.instance = new AIProxyService();
    }
    return AIProxyService.instance;
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.rateLimiter.get(userId) || [];
    
    // Remove requests older than the rate limit window
    const recentRequests = userRequests.filter(time => now - time < this.RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= this.RATE_LIMIT) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimiter.set(userId, recentRequests);
    return true;
  }

  public async getAIResponse(query: string, userId: string): Promise<AIResponse> {
    try {
      // Check rate limit
      if (!this.checkRateLimit(userId)) {
        return {
          response: '',
          error: 'Rate limit exceeded. Please try again later.'
        };
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are an expert real estate investment advisor named EquiXtate Advisor. Provide helpful, concise advice about real estate investing, tokenization, market trends, and investment strategies. Focus on explaining concepts related to fractional ownership, property tokens, ROI calculations, and risk management in real estate. Keep responses informative but brief (100-150 words maximum)."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.5,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        response: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        response: '',
        error: 'Failed to get AI response. Please try again later.'
      };
    }
  }
}

export default AIProxyService.getInstance(); 