export interface PurchaseInfo {
  price: number;
  date: string;
  warranty: string;
}

export interface Specifications {
  brand: string;
  version: string;
  type: 'Perpetual' | 'Subscription';
}

export interface Item {
  _id: string;
  code: string;
  name: string;
  category: string;
  specifications: Specifications;
  condition: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Buruk' | 'Rusak Ringan' | 'Rusak Berat';
  status: 'Tersedia' | 'Dipinjam' | 'Maintenance';
  location: string;
  images: string[];
  notes?: string;
  purchaseInfo: PurchaseInfo;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemsQueryParams {
  category?: string;
  condition?: string;
  location?: string;
  sort?: string;
  page: number;
  limit: number;
  fields?: string;
  search?: string;
  status?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export interface ItemsResponse {
  status: string;
  results: number;
  pagination: PaginationMeta;
  data: {
    items: Item[];
  };
}

export interface CategoryStats {
  _id: string;
  count: number;
  totalValue: number;
}

export interface ConditionStats {
  _id: string;
  count: number;
}

export interface OverallStats {
  _id: null;
  totalItems: number;
  totalValue: number;
  avgValue: number;
  minValue: number;
  maxValue: number;
}

export interface ItemStats {
  overall: OverallStats;
  byCategory: CategoryStats[];
  byCondition: ConditionStats[];
}

export interface ItemStatsResponse {
  status: string;
  data: {
    overall: OverallStats;
    byCategory: CategoryStats[];
    byCondition: ConditionStats[];
  };
} 