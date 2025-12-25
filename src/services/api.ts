interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  admin: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
  };
}

interface AdminProfileResponse {
  admin: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
  };
}

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Admin extends AdminProfile {
  status: string;
  roles?: Role[];
}

interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  status: string;
  roles?: number[];
}

interface UpdateAdminRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  status?: string;
  roles?: number[];
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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
  song_languages?: SongLanguage[];
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
  song_language_ids?: number[];
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
  song_language_ids?: number[];
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
  sort_no: number;
  created_at: string;
  updated_at: string;
}

interface SongLanguage {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface SuggestSong {
  id: number;
  code: number;
  title: string;
  youtube?: string;
  description?: string;
  song_writer?: string;
  style_id?: number | null;
  key?: string;
  lyrics?: string;
  music_notes?: string;
  popular_rating?: number;
  email?: string;
  status: number; // 0 = cancelled, 1 = pending, 2 = approved
  created_at: string;
  updated_at: string;
  style?: Style;
  categories?: Category[];
}

interface UpdateSuggestSongRequest {
  code?: number;
  title?: string;
  youtube?: string;
  description?: string;
  song_writer?: string;
  style_id?: number;
  key?: string;
  lyrics?: string;
  music_notes?: string;
  popular_rating?: number;
  email?: string;
  category_ids?: number[];
}

interface ApproveSuggestionResponse {
  message: string;
  suggestion: {
    id: number;
    status: number;
  };
  song: {
    id: number;
    title: string;
    code: number;
    slug: string;
    categories: Category[];
    song_languages: SongLanguage[];
  };
}

interface CancelSuggestionResponse {
  message: string;
  suggestion: {
    id: number;
    status: number;
  };
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

    // Store admin details with roles
    localStorage.setItem('admin_details', JSON.stringify(response.admin));

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
    // Store admin details with roles
    localStorage.setItem('admin_details', JSON.stringify(response.admin));
    return {
      id: response.admin.id,
      name: response.admin.name,
      email: response.admin.email,
      created_at: response.admin.created_at,
      updated_at: response.admin.updated_at
    };
  }

  async getAdmins(page: number = 1, search?: string): Promise<PaginatedResponse<Admin>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (search) {
      params.append('search', search);
    }
    return this.request<PaginatedResponse<Admin>>(`/admins?${params.toString()}`);
  }

  async createAdmin(admin: CreateAdminRequest): Promise<Admin> {
    return this.request<Admin>('/admins', {
      method: 'POST',
      body: JSON.stringify(admin),
    });
  }

  async getAdmin(id: number): Promise<Admin> {
    return this.request<Admin>(`/admins/${id}`);
  }

  async updateAdmin(id: number, admin: UpdateAdminRequest): Promise<Admin> {
    return this.request<Admin>(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(admin),
    });
  }

  async deleteAdmin(id: number): Promise<void> {
    return this.request<void>(`/admins/${id}`, {
      method: 'DELETE',
    });
  }

  async getSongs(
    page: number = 1,
    search?: string,
    styleId?: number,
    categoryIds?: number[],
    songLanguageIds?: number[],
    sortBy?: 'created_at' | 'id',
    sortOrder?: 'asc' | 'desc',
    id?: number
  ): Promise<PaginatedResponse<Song>> {
    const params = new URLSearchParams()
    params.append('page', String(page))

    if (search) {
      params.append('search', search)
    }

    if (styleId !== undefined && styleId !== null) {
      params.append('style_id', String(styleId))
    }

    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(categoryId => params.append('category_ids[]', String(categoryId)))
    }

    if (songLanguageIds && songLanguageIds.length > 0) {
      songLanguageIds.forEach(langId => params.append('song_language_ids[]', String(langId)))
    }

    if (sortBy) {
      params.append('sort_by', sortBy)
    }

    if (sortOrder) {
      params.append('sort_order', sortOrder)
    }

    if (id !== undefined && id !== null) {
      params.append('id', String(id))
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

  async getAllCategories(): Promise<Category[]> {
    // Get all categories without pagination for filter dropdown
    const response = await this.request<PaginatedResponse<Category>>('/categories?per_page=1000');
    return response.data;
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

  async getSongLanguages(): Promise<SongLanguage[]> {
    return this.request<SongLanguage[]>('/song-languages');
  }

  async createSongLanguage(songLanguage: Omit<SongLanguage, 'id' | 'created_at' | 'updated_at'>): Promise<SongLanguage> {
    return this.request<SongLanguage>('/song-languages', {
      method: 'POST',
      body: JSON.stringify(songLanguage),
    });
  }

  async getSongLanguage(id: string): Promise<SongLanguage> {
    return this.request<SongLanguage>(`/song-languages/${id}`);
  }

  async updateSongLanguage(id: string, songLanguage: Partial<Omit<SongLanguage, 'id' | 'created_at' | 'updated_at'>>): Promise<SongLanguage> {
    return this.request<SongLanguage>(`/song-languages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(songLanguage),
    });
  }

  async deleteSongLanguage(id: number): Promise<void> {
    return this.request<void>(`/song-languages/${id}`, {
      method: 'DELETE',
    });
  }

  async getRoles(): Promise<Role[]> {
    return this.request<Role[]>('/roles');
  }

  async getSuggestSongs(
    page: number = 1,
    status?: number,
    search?: string,
    styleId?: number,
    categoryId?: number
  ): Promise<PaginatedResponse<SuggestSong>> {
    const params = new URLSearchParams();
    params.append('page', String(page));

    if (status !== undefined && status !== null) {
      params.append('status', String(status));
    }

    if (search) {
      params.append('search', search);
    }

    if (styleId !== undefined && styleId !== null) {
      params.append('style_id', String(styleId));
    }

    if (categoryId !== undefined && categoryId !== null) {
      params.append('category_id', String(categoryId));
    }

    return this.request<PaginatedResponse<SuggestSong>>(`/suggest-songs?${params.toString()}`);
  }

  async getSuggestSong(id: number): Promise<SuggestSong> {
    return this.request<SuggestSong>(`/suggest-songs/${id}`);
  }

  async updateSuggestSong(id: number, data: UpdateSuggestSongRequest): Promise<SuggestSong> {
    return this.request<SuggestSong>(`/suggest-songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveSuggestSong(id: number): Promise<ApproveSuggestionResponse> {
    return this.request<ApproveSuggestionResponse>(`/suggest-songs/${id}/approve`, {
      method: 'POST',
    });
  }

  async cancelSuggestSong(id: number): Promise<CancelSuggestionResponse> {
    return this.request<CancelSuggestionResponse>(`/suggest-songs/${id}/cancel`, {
      method: 'POST',
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    try {
      const adminDetails = localStorage.getItem('admin_details');
      if (!adminDetails) return false;

      const admin = JSON.parse(adminDetails);
      return Array.isArray(admin.roles) && admin.roles.some((role: Role) => role.id === 1);
    } catch (e) {
      return false;
    }
  }
}

export default new ApiService();
export type { 
  LoginCredentials, 
  LoginResponse, 
  AdminProfile, 
  Admin, 
  Role, 
  Song, 
  Style, 
  Category, 
  SongLanguage, 
  PaginatedResponse, 
  CreateSongRequest, 
  UpdateSongRequest, 
  CreateAdminRequest, 
  UpdateAdminRequest,
  SuggestSong,
  UpdateSuggestSongRequest,
  ApproveSuggestionResponse,
  CancelSuggestionResponse
};