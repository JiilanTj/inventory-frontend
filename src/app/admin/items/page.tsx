'use client';

import { useState, useEffect } from 'react';
import { Item, ItemStats, PaginationMeta } from '@/models/item';
import { getItems, getItemStats } from '@/services/items';
import ItemsTable from '@/components/admin/ItemsTable';
import { formatCurrency } from '@/utils/format';

type SortableFields = keyof Pick<Item, 'name' | 'status' | 'condition' | 'location'> | 'price';

interface SortConfig {
  key: SortableFields;
  direction: 'asc' | 'desc';
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const fetchItems = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getItems({
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sort: `${sortConfig.key}:${sortConfig.direction}`
      });
      
      console.log('API Response:', response);
      
      if (response.data?.items) {
        setItems(response.data.items);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      } else {
        console.error('Invalid response format:', response);
        setItems([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await getItemStats();
        setStats(statsResponse.data);
        fetchItems(1);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Refetch when filters or sort change
  useEffect(() => {
    fetchItems(1);
  }, [searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: SortableFields) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (newPage: number) => {
    fetchItems(newPage);
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and monitor all inventory items in one place.
        </p>
      </div>

      {/* Stats Accordion */}
      <div className="bg-white rounded-lg shadow mb-8">
        <button
          className="w-full px-6 py-4 flex items-center justify-between text-left"
          onClick={() => setIsStatsOpen(!isStatsOpen)}
        >
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">Inventory Statistics</h2>
            <span className="ml-2 text-sm text-gray-500">
              (Total Value: {formatCurrency(stats.overall.totalValue)})
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${isStatsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Stats Content */}
        {isStatsOpen && (
          <div className="px-6 pb-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.overall.totalItems}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Average Value</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(stats.overall.avgValue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Minimum Value</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(stats.overall.minValue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Maximum Value</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(stats.overall.maxValue)}</p>
              </div>
            </div>

            {/* Category and Condition Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Items by Category</h3>
                <div className="space-y-3">
                  {stats.byCategory.map(category => (
                    <div key={category._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{category._id}</span>
                        <span className="ml-2 text-sm text-gray-500">({category.count} items)</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(category.totalValue)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Items by Condition</h3>
                <div className="space-y-3">
                  {stats.byCondition.map(condition => (
                    <div key={condition._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-900">{condition._id}</span>
                      <span className="font-medium text-gray-900">{condition.count} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search items..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Status Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Tersedia">Available</option>
                <option value="Dipinjam">Borrowed</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {/* TODO: Export to Excel */}}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Export
              </button>
              <button
                onClick={() => {/* TODO: Add New Item */}}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add New Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <ItemsTable 
            items={items}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination */}
          {!isLoading && items.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {pagination.total > 0 ? (
                      <>
                        Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </>
                    ) : (
                      'No results found'
                    )}
                  </p>
                </div>
                {pagination.total > 0 && (
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const isFirstPage = page === 1;
                          const isLastPage = page === pagination.totalPages;
                          const isCurrentPage = page === pagination.page;
                          const isNearCurrentPage = Math.abs(page - pagination.page) <= 1;
                          return isFirstPage || isLastPage || isCurrentPage || isNearCurrentPage;
                        })
                        .map((page, index, array) => {
                          if (index > 0 && page - array[index - 1] > 1) {
                            return (
                              <span
                                key={`ellipsis-${page}`}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                page === pagination.page
                                  ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 