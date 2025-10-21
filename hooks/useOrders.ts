import { useState, useEffect } from 'react';
import { apiClient, Order, handleApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface UseOrdersOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoFetch?: boolean;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: any;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    autoFetch = true,
  } = options;

  const fetchOrders = async (reset = true) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getUserOrders({
        page: reset ? 1 : page,
        limit,
        status,
        search,
        sortBy,
        sortOrder,
      });

      if (reset) {
        setOrders(Array.isArray(result.orders) ? result.orders : []);
      } else {
        setOrders(prev => [...prev, ...(Array.isArray(result.orders) ? result.orders : [])]);
      }
      
      setPagination(result.pagination);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!pagination || pagination.currentPage >= pagination.totalPages) return;
    
    try {
      const result = await apiClient.getUserOrders({
        page: pagination.currentPage + 1,
        limit,
        status,
        search,
        sortBy,
        sortOrder,
      });

      setOrders(prev => [...prev, ...(Array.isArray(result.orders) ? result.orders : [])]);
      setPagination(result.pagination);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      fetchOrders();
    }
  }, [status, search, sortBy, sortOrder, autoFetch, isAuthenticated]);

  return {
    orders,
    loading,
    error,
    pagination,
    refetch: () => fetchOrders(true),
    fetchMore,
    hasMore: pagination ? pagination.currentPage < pagination.totalPages : false,
  };
}

export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchOrder = async () => {
    if (!orderId || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getOrderById(orderId);
      setOrder(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId, isAuthenticated]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}