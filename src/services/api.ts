interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface AdminProfileResponse {
  admin: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  };
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
  admin_id: number;
  style_id: number | null;
  code: number;
  slug: string;
  title: string;
  youtube?: string;
  description?: string;
  song_writer?: string;
  lyrics?: string;
  music_notes?: string;
  popular_rating?: number;
  created_at: string;
  updated_at: string;
  style?: Style;
  categories?: Category[];
}

interface CreateSongRequest {
  title: string;
  youtube?: string;
  description?: string;
  song_writer?: string;
  style_id?: number | null;
  lyrics?: string;
  music_notes?: string;
  popular_rating?: number;
  category_ids?: number[];
}

interface UpdateSongRequest {
  title?: string;
  youtube?: string;
  description?: string;
  song_writer?: string;
  style_id?: number | null;
  lyrics?: string;
  music_notes?: string;
  popular_rating?: number;
  category_ids?: number[];
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

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
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
      'Accept': 'application/json',
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
      if (response.status === 401) {
        this.token = null;
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
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

  async getAdminDetail(): Promise<AdminProfile> {
    const response = await this.request<AdminProfileResponse>('');
    return {
      id: response.admin.id,
      name: response.admin.name,
      email: response.admin.email,
      created_at: response.admin.created_at,
      updated_at: response.admin.updated_at
    };
  }

  async getSongs(page: number = 1, search?: string): Promise<PaginatedResponse<Song>> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (search) {
      params.append('search', search)
    }
    return this.request<PaginatedResponse<Song>>(`/songs?${params.toString()}`)
  }

  async createSong(song: CreateSongRequest): Promise<Song> {
    return this.request<Song>('/songs', {
      method: 'POST',
      body: JSON.stringify(song),
    });
  }

  async getSong(id: number): Promise<Song> {
    return this.request<Song>(`/songs/${id}`);
  }

  async updateSong(id: number, song: UpdateSongRequest): Promise<Song> {
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

  async getCategories(page: number = 1, search?: string): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    if (search) {
      params.append('search', search)
    }
    return this.request<PaginatedResponse<Category>>(`/categories?${params.toString()}`)
  }

  async createCategory(category: Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async updateCategory(id: number, category: Partial<Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default new ApiService();
export type { LoginCredentials, LoginResponse, AdminProfile, Song, Style, Category, PaginatedResponse, CreateSongRequest, UpdateSongRequest };