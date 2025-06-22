import { Item } from '@/models/item';
import { formatCurrency } from '@/utils/format';
import Image from 'next/image';

interface ItemsGridProps {
  items: Item[];
  isLoading: boolean;
}

export default function ItemsGrid({ items, isLoading }: ItemsGridProps) {
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item._id}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative h-48 bg-gray-200">
            {item.images && item.images.length > 0 ? (
              <Image
                src={item.images[0]}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{item.code}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                item.status === 'Tersedia' ? 'bg-green-100 text-green-800' :
                item.status === 'Dipinjam' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {item.category}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </div>

              <div className="flex items-center text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  item.condition === 'Sangat Baik' ? 'bg-green-100 text-green-800' :
                  item.condition === 'Baik' ? 'bg-blue-100 text-blue-800' :
                  item.condition === 'Cukup' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.condition}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Price</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(item.purchaseInfo.price)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 