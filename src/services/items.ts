import { ItemsResponse, ItemStatsResponse, ItemsQueryParams } from '@/models/item';

import { API_BASE_URL } from '@/config/constants';

export async function getItems(params: ItemsQueryParams): Promise<ItemsResponse> {
  // Convert params to URLSearchParams
  const searchParams = new URLSearchParams();
  
  if (params.search) searchParams.append('search', params.search);
  if (params.category) searchParams.append('category', params.category);
  if (params.condition) searchParams.append('condition', params.condition);
  if (params.location) searchParams.append('location', params.location);
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.fields) searchParams.append('fields', params.fields);
  
  // Always include pagination params
  searchParams.append('page', params.page.toString());
  searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/items?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    // Add cache control headers
    cache: 'no-cache', // Disable caching to prevent 304
  });

  // Log the raw response for debugging
  console.log('Raw API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok && response.status !== 304) {
    throw new Error('Failed to fetch items');
  }

  const data = await response.json();
  
  // Log the parsed data
  console.log('Parsed API Response:', data);

  // Format response according to actual API structure
  const formattedResponse: ItemsResponse = {
    status: data.status,
    results: data.results || 0,
    pagination: {
      page: Number(params.page),
      limit: Number(params.limit),
      total: Number(data.total || 0),
      totalPages: Math.ceil(Number(data.total || 0) / params.limit)
    },
    data: {
      items: Array.isArray(data.data?.items) ? data.data.items : []
    }
  };

  return formattedResponse;
}

export async function getItemStats(): Promise<ItemStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/items/stats`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch item statistics');
  }

  return response.json();
} 