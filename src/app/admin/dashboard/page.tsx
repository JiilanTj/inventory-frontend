'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Item, ItemStats } from '@/models/item';
import { getItems, getItemStats } from '@/services/items';
import ItemsTable from '@/components/admin/ItemsTable';
import { formatCurrency } from '@/utils/format';

type SortableFields = keyof Pick<Item, 'name' | 'status' | 'condition' | 'location'> | 'price';

interface SortConfig {
  key: SortableFields;
  direction: 'asc' | 'desc';
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsResponse, statsResponse] = await Promise.all([
          getItems({
            page: 1,
            limit: 5,
            sort: 'createdAt:desc'
          }),
          getItemStats()
        ]);
        setItems(itemsResponse.data.items);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key: SortableFields) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (sortConfig.key === 'price') {
      const aValue = a.purchaseInfo.price;
      const bValue = b.purchaseInfo.price;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  if (!user || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total Items</h2>
              <p className="text-lg font-semibold text-gray-900">{stats.overall.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total Value</h2>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.overall.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Average Value</h2>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.overall.avgValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Max Value</h2>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.overall.maxValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Items by Category</h2>
          <div className="space-y-4">
            {stats.byCategory.map(category => (
              <div key={category._id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-600">{category._id}</span>
                  <span className="ml-2 text-xs text-gray-500">({category.count} items)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(category.totalValue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Items by Condition</h2>
          <div className="space-y-4">
            {stats.byCondition.map(condition => (
              <div key={condition._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{condition._id}</span>
                <span className="text-sm font-semibold text-gray-900">{condition.count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Recent Items</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add New Item
            </button>
          </div>
        </div>
        <div className="p-6">
          <ItemsTable 
            items={sortedItems.slice(0, 5)} 
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      </div>
    </div>
  );
} 