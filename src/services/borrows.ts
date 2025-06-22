import { BorrowsResponse, BorrowsQueryParams, Borrow } from '@/models/borrow';
import { API_BASE_URL } from '@/config/constants';
import { getToken } from '@/services/auth';

export async function getBorrows(params: BorrowsQueryParams): Promise<BorrowsResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Convert params to URLSearchParams
  const searchParams = new URLSearchParams();
  
  if (params.status) searchParams.append('status', params.status);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  
  // Always include pagination params
  searchParams.append('page', params.page.toString());
  searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/borrows?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
  });

  console.log('Raw Borrows API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok && response.status !== 304) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in again');
    }
    throw new Error('Failed to fetch borrows');
  }

  const data = await response.json();
  console.log('Parsed Borrows API Response:', data);

  // Format response according to API structure
  const formattedResponse: BorrowsResponse = {
    status: data.status,
    results: data.results || 0,
    total: data.total || 0,
    data: {
      borrows: Array.isArray(data.data?.borrows) ? data.data.borrows : []
    },
    pagination: {
      page: Number(params.page),
      limit: Number(params.limit),
      total: Number(data.total || 0),
      totalPages: Math.ceil(Number(data.total || 0) / params.limit)
    }
  };

  return formattedResponse;
}

export async function getBorrowById(id: string): Promise<Borrow> {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/borrows/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in again');
    }
    throw new Error('Failed to fetch borrow details');
  }

  const data = await response.json();
  return data.data.borrow;
}

// PATCH /borrows/{id} for approval/reject/return
export async function updateBorrowApproval(
  id: string,
  status: string,
  returnCondition?: string,
  returnNotes?: string
): Promise<Borrow> {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  const body: any = { status };
  if (returnCondition) body.returnCondition = returnCondition;
  if (returnNotes) body.returnNotes = returnNotes;

  const response = await fetch(`${API_BASE_URL}/borrows/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - Please log in again');
    }
    throw new Error('Failed to update borrow approval');
  }

  const data = await response.json();
  return data.data.borrow;
} 