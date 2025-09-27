import { CartItem } from './store';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  userName: string;
  role: string;
  profileImage?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  expiresAt: string;
}

export interface Product {
  _id: string;
  handle: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  images: Array<{
    secure_url: string;
    public_id: string;
  }>;
  tags: string[];
  category: {
    _id: string;
    name: string;
    type: string;
  };
  inStock: boolean;
  promotion?: {
    isOnSale: boolean;
    originalPrice?: number;
    salePrice?: number;
    saleEndDate?: string;
  };
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
  colors?: Array<{
    name: string;
    hex?: string;
    available: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: string;
  logo: {
    secure_url: string;
    public_id: string;
  };
  createdAt: string;
}

export interface Order {
  _id: string;
  userId: string;
  productName: string;
  items?: CartItem[];
  shippingInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
}

export interface CheckoutRequest {
  items: CartItem[];
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  paymentMethod: 'cod' | 'stripe';
  currency: 'EGP' | 'USD';
  idempotencyKey: string;
  couponCode?: string;
  notes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  orderId: string;
  userId: string;
  totalAmount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  paymentToken?: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private version: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.version = API_VERSION;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Version': this.version,
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || 'API request failed');
    }

    return data;
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<ApiResponse<AuthResponse>>(response);
    return data.data!;
  }

  async signup(userData: {
    email: string;
    password: string;
    cPassword: string;
    userName: string;
    phone: string;
  }): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async confirmEmail(email: string, code: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/confirm-email`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, code }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async getUserProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<ApiResponse<User>>(response);
    return data.data!;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ refreshToken }),
    });

    const data = await this.handleResponse<ApiResponse<{ accessToken: string }>>(response);
    return data.data!;
  }

  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Product APIs
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
    sort?: string;
  }): Promise<{
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.inStock !== undefined) searchParams.append('inStock', params.inStock.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${this.baseURL}/products?${searchParams}`, {
      headers: this.getHeaders(false),
    });

    const apiResponse = await this.handleResponse<{
      success: boolean;
      data: Product[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(response);
    
    return {
      products: apiResponse.data,
      pagination: apiResponse.pagination
    };
  }

  async getProductById(productId: string): Promise<Product> {
    const response = await fetch(`${this.baseURL}/products/${encodeURIComponent(productId)}`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both direct product response and wrapped response
    if (data.success && data.data) {
      return data.data;
    } else if (data._id) {
      return data;
    } else {
      throw new Error('Invalid product data received');
    }
  }

  async getProductByHandle(handle: string): Promise<Product> {
    const response = await fetch(`${this.baseURL}/products/handle/${encodeURIComponent(handle)}`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both direct product response and wrapped response
    if (data.success && data.data) {
      return data.data;
    } else if (data._id) {
      return data;
    } else {
      throw new Error('Invalid product data received');
    }
  }

  // Category APIs
  async getCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sort?: string;
  }): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${this.baseURL}/category/AllCategory?${searchParams}`, {
      headers: this.getHeaders(false),
    });

    const data = await this.handleResponse<ApiResponse<Category[]>>(response);
    return data.data!;
  }

  async getCategoryById(categoryId: string): Promise<Category> {
    const response = await fetch(`${this.baseURL}/category/${categoryId}`, {
      headers: this.getHeaders(false),
    });

    const data = await this.handleResponse<ApiResponse<Category>>(response);
    return data.data!;
  }

  // Order APIs
  async createCartOrder(orderData: {
    items: CartItem[];
    shippingInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postalCode?: string;
    };
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    paymentMethod: 'card' | 'cash';
    couponCode?: string;
    note?: string;
  }): Promise<Order> {
    const response = await fetch(`${this.baseURL}/order/cart`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await this.handleResponse<ApiResponse<Order>>(response);
    return data.data!;
  }

  async getUserOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    orders: Order[];
    pagination: any;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseURL}/order?${searchParams}`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<ApiResponse<Order[]>>(response);
    return {
      orders: data.data!,
      pagination: (data as any).pagination || {}
    };
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseURL}/order/${orderId}`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<ApiResponse<Order>>(response);
    return data.data!;
  }

  async checkoutOrder(orderId: string): Promise<{
    sessionUrl?: string;
    sessionId?: string;
    finalAmount: number;
  }> {
    const response = await fetch(`${this.baseURL}/order/${orderId}/checkout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<ApiResponse<any>>(response);
    return data.data!;
  }

  // Checkout APIs
  async processCheckout(checkoutData: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await fetch(`${this.baseURL}/checkout`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(checkoutData),
    });

    return this.handleResponse<CheckoutResponse>(response);
  }

  async processAuthenticatedCheckout(checkoutData: Omit<CheckoutRequest, 'guestInfo'>): Promise<CheckoutResponse> {
    const response = await fetch(`${this.baseURL}/checkout/authenticated`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(checkoutData),
    });

    return this.handleResponse<CheckoutResponse>(response);
  }

  async getOrderStatus(orderId: string): Promise<{
    orderId: string;
    status: string;
    totalAmount: number;
    currency: string;
    paymentGateway: string;
    createdAt: string;
  }> {
    const response = await fetch(`${this.baseURL}/checkout/order/${orderId}/status`, {
      headers: this.getHeaders(false),
    });

    const data = await this.handleResponse<ApiResponse<any>>(response);
    return data.data!;
  }

  // Coupon APIs
  async validateCoupon(code: string, orderAmount: number): Promise<{
    coupon: {
      id: string;
      code: string;
      name: string;
      type: string;
      value: number;
    };
    discountAmount: number;
    finalAmount: number;
  }> {
    const response = await fetch(`${this.baseURL}/coupon/validate`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ code, orderAmount }),
    });

    const data = await this.handleResponse<ApiResponse<any>>(response);
    return data.data!;
  }

  async getCouponDetails(couponCode: string): Promise<{
    code: string;
    name: string;
    type: string;
    value: number;
    minOrderAmount: number;
    maxDiscount: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
    status: {
      isValid: boolean;
      reason: string;
    };
  }> {
    const response = await fetch(`${this.baseURL}/coupon/details/${couponCode}`, {
      headers: this.getHeaders(false),
    });

    const data = await this.handleResponse<ApiResponse<any>>(response);
    return data.data!;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; uptime: number }> {
    const response = await fetch(`${this.baseURL}/health`, {
      headers: this.getHeaders(false),
    });

    return this.handleResponse<{ status: string; uptime: number }>(response);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper functions
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function handleApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}