'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Item } from '@/models/item';
import { getItems } from '@/services/items';
import ItemsGrid from '@/components/user/ItemsGrid';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getItems();
        setItems(response.data.items);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Inventory System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">{user.class}</p>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Available Items</h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse through our inventory of available items
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input
                type="text"
                placeholder="Search items..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Lab Equipment">Lab Equipment</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Locations</option>
                <option value="Lab 1">Lab 1</option>
                <option value="Lab 2">Lab 2</option>
                <option value="Lab 3">Lab 3</option>
                <option value="Gudang">Gudang</option>
              </select>
            </div>
          </div>
          
          <ItemsGrid items={items} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
} 