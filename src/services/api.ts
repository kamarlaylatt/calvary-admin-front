interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Song {
  id: number;
  title: string;
  youtube?: string;
  description?: string;
  song_writer?: string;
  style_id: number;
  lyrics?: string;
  music_notes?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Style {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/admin';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('admin_token', response.token);
    
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/logout', {
      method: 'POST',
    });
    
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  async getAdminProfile(): Promise<AdminProfile> {
    return this.request<AdminProfile>('');
  }

  async getSongs(page: number = 1, search?: string): Promise<PaginatedResponse<Song>> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (search) {
      params.append('search', search)
    }
    return this.request<PaginatedResponse<Song>>(`/songs?${params.toString()}`)
  }

  async createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<Song> {
    return this.request<Song>('/songs', {
      method: 'POST',
      body: JSON.stringify(song),
    });
  }

  async getSong(id: number): Promise<Song> {
    return this.request<Song>(`/songs/${id}`);
  }

  async updateSong(id: number, song: Partial<Omit<Song, 'id' | 'created_at' | 'updated_at'>>): Promise<Song> {
    return this.request<Song>(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(song),
    });
  }

  async deleteSong(id: number): Promise<void> {
    return this.request<void>(`/songs/${id}`, {
      method: 'DELETE',
    });
  }

  async getStyles(): Promise<Style[]> {
    return this.request<Style[]>('/styles');
  }

  async createStyle(style: Omit<Style, 'id' | 'created_at' | 'updated_at'>): Promise<Style> {
    return this.request<Style>('/styles', {
      method: 'POST',
      body: JSON.stringify(style),
    });
  }

  async getStyle(id: number): Promise<Style> {
    return this.request<Style>(`/styles/${id}`);
  }

  async updateStyle(id: number, style: Partial<Omit<Style, 'id' | 'created_at' | 'updated_at'>>): Promise<Style> {
    return this.request<Style>(`/styles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(style),
    });
  }

  async deleteStyle(id: number): Promise<void> {
    return this.request<void>(`/styles/${id}`, {
      method: 'DELETE',
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default new ApiService();
export type { LoginCredentials, LoginResponse, AdminProfile, Song, Style, PaginatedResponse };