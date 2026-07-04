import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis?: string;
  episodes?: number;
  status?: string;
  score?: number;
  year?: number;
  season?: string;
  genres?: Array<{ mal_id: number; name: string }>;
  studios?: Array<{ mal_id: number; name: string }>;
}

export interface JikanSearchResponse {
  data: JikanAnime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

export interface JikanSeasonResponse {
  data: JikanAnime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

class JikanAPIService {
  private lastRequestTime = 0;
  private requestDelay = 1000; // 1 second between requests (Jikan rate limit)

  private async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  async searchAnime(query: string, page: number = 1): Promise<JikanSearchResponse> {
    await this.rateLimit();
    const response = await axios.get<JikanSearchResponse>(`${JIKAN_BASE_URL}/anime`, {
      params: {
        q: query,
        page,
        limit: 20,
        order_by: 'popularity',
      },
    });
    return response.data;
  }

  async getAnimeById(id: number): Promise<JikanAnime> {
    await this.rateLimit();
    const response = await axios.get<{ data: JikanAnime }>(`${JIKAN_BASE_URL}/anime/${id}`);
    return response.data.data;
  }

  async getCurrentSeason(page: number = 1): Promise<JikanSeasonResponse> {
    await this.rateLimit();
    const response = await axios.get<JikanSeasonResponse>(`${JIKAN_BASE_URL}/seasons/now`, {
      params: {
        page,
        limit: 20,
      },
    });
    return response.data;
  }

  async getSeasonAnime(year: number, season: 'winter' | 'spring' | 'summer' | 'fall', page: number = 1): Promise<JikanSeasonResponse> {
    await this.rateLimit();
    const response = await axios.get<JikanSeasonResponse>(`${JIKAN_BASE_URL}/seasons/${year}/${season}`, {
      params: {
        page,
        limit: 20,
      },
    });
    return response.data;
  }

  async getTopAnime(page: number = 1): Promise<JikanSearchResponse> {
    await this.rateLimit();
    const response = await axios.get<JikanSearchResponse>(`${JIKAN_BASE_URL}/top/anime`, {
      params: {
        page,
        limit: 20,
      },
    });
    return response.data;
  }
}

export const jikanAPI = new JikanAPIService();
