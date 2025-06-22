import { Item } from '@/models/item';
import { formatCurrency } from '@/utils/format';

type SortableFields = keyof Pick<Item, 'name' | 'status' | 'condition' | 'location'> | 'price';

interface SortConfig {
  key: SortableFields;
  direction: 'asc' | 'desc';
}

interface ItemsTableProps {
  items: Item[];
  isLoading: boolean;
  sortConfig: SortConfig;
  onSort: (key: SortableFields) => void;
}

export default function ItemsTable({ items, isLoading, sortConfig, onSort }: ItemsTableProps) {
  const renderSortIcon = (key: SortableFields) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const renderStatus = (status: string) => {
    const statusStyles = {
      Tersedia: 'bg-green-100 text-green-800',
      Dipinjam: 'bg-blue-100 text-blue-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
    } as const;

    const style = statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
        {status}
      </span>
    );
  };

  const renderCondition = (condition: string) => {
    const conditionStyles = {
      'Sangat Baik': 'bg-green-100 text-green-800',
      'Baik': 'bg-blue-100 text-blue-800',
      'Cukup': 'bg-yellow-100 text-yellow-800',
      'Buruk': 'bg-red-100 text-red-800',
    } as const;

    const style = conditionStyles[condition as keyof typeof conditionStyles] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
        {condition}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>No items found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">
                Item
                {renderSortIcon('name')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('location')}
            >
              <div className="flex items-center gap-2">
                Location
                {renderSortIcon('location')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-2">
                Status
                {renderSortIcon('status')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('condition')}
            >
              <div className="flex items-center gap-2">
                Condition
                {renderSortIcon('condition')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('price')}
            >
              <div className="flex items-center gap-2">
                Price
                {renderSortIcon('price')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {item.images && item.images.length > 0 ? (
                    <img className="h-10 w-10 rounded-full object-cover" src={item.images[0]} alt={item.name} />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.notes}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderStatus(item.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderCondition(item.condition)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(item.purchaseInfo.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {/* TODO: View Details */}}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {/* TODO: Edit Item */}}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {/* TODO: Delete Item */}}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 