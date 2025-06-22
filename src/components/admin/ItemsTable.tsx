import { Item } from '@/models/item';
import { formatCurrency } from '@/utils/format';
import React, { useState } from 'react';
import { addItem, getItemById, updateItem, deleteItem } from '@/services/items';

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
  onSuccess?: () => void;
}

export default function ItemsTable({ items, isLoading, sortConfig, onSort, onSuccess }: ItemsTableProps) {
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleView = async (id: string) => {
    try {
      const res = await getItemById(id);
      setViewItem(res.data.item);
    } catch (err) {
      alert('Failed to fetch item');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await getItemById(id);
      setEditItem(res.data.item);
      setEditError('');
    } catch (err) {
      alert('Failed to fetch item');
    }
  };

  const handleEditSubmit = async (form: any) => {
    if (!editItem) return;
    setEditLoading(true);
    setEditError('');
    try {
      const specsObj: Record<string, string> = {};
      form.specifications.forEach(({ key, value }: any) => {
        if (key) specsObj[key] = value;
      });
      const payload = {
        ...form,
        specifications: specsObj,
        purchaseInfo: {
          ...form.purchaseInfo,
          price: Number(form.purchaseInfo.price),
        },
      };
      await updateItem(editItem._id, payload);
      setEditItem(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteItem(deleteId);
      setDeleteId(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

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
                    onClick={() => handleView(item._id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(item._id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(item._id)}
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

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8 relative border border-gray-200">
            <button onClick={() => setViewItem(null)} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-2xl leading-none">&times;</button>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Item Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</div>
                <div className="text-lg font-semibold text-gray-900">{viewItem.name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</div>
                <div className="text-base text-gray-800">{viewItem.category}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div>
                <div className="text-base text-gray-800">{viewItem.status}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Condition</div>
                <div className="text-base text-gray-800">{viewItem.condition}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</div>
                <div className="text-base text-gray-800">{viewItem.location}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</div>
                <div className="text-base text-gray-700">{viewItem.notes || <span className="italic text-gray-400">-</span>}</div>
              </div>
            </div>
            <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="font-semibold text-gray-900 mb-2">Purchase Info</div>
              <div className="flex flex-col md:flex-row md:gap-8 gap-2 text-sm">
                <div><span className="font-medium text-gray-700">Price:</span> <span className="text-gray-900">{viewItem.purchaseInfo?.price}</span></div>
                <div><span className="font-medium text-gray-700">Purchase Date:</span> <span className="text-gray-900">{viewItem.purchaseInfo?.date?.slice(0, 10)}</span></div>
                <div><span className="font-medium text-gray-700">Warranty Until:</span> <span className="text-gray-900">{viewItem.purchaseInfo?.warranty?.slice(0, 10)}</span></div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="font-semibold text-gray-900 mb-2">Specifications</div>
              {viewItem.specifications && Object.keys(viewItem.specifications).length > 0 ? (
                <ul className="ml-2 list-disc text-sm text-gray-900 space-y-1">
                  {Object.entries(viewItem.specifications).map(([k, v]) => (
                    <li key={k}><span className="font-medium text-gray-700">{k}:</span> <span className="text-gray-900">{v as string}</span></li>
                  ))}
                </ul>
              ) : (
                <div className="italic text-gray-400">No specifications</div>
              )}
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <AddItemModal
          open={true}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            setEditItem(null);
            if (onSuccess) onSuccess();
          }}
          initialData={editItem}
          isEdit
          onEditSubmit={handleEditSubmit}
          editLoading={editLoading}
          editError={editError}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative border border-gray-200">
            <button onClick={() => setDeleteId(null)} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-2xl leading-none">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Item</h2>
            <p className="mb-4 text-gray-900">Are you sure you want to delete this item?</p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  isEdit?: boolean;
  onEditSubmit?: (form: any) => void;
  editLoading?: boolean;
  editError?: string;
}

export function AddItemModal({ open, onClose, onSuccess, initialData, isEdit, onEditSubmit, editLoading, editError }: AddItemModalProps) {
  const [form, setForm] = useState(() => {
    if (initialData) {
      // Convert specifications object to array
      const specsArr = initialData.specifications
        ? Object.entries(initialData.specifications).map(([key, value]: [string, unknown]) => ({ key, value: String(value) }))
        : [{ key: '', value: '' }];
      return {
        ...initialData,
        specifications: specsArr,
        purchaseInfo: {
          ...initialData.purchaseInfo,
          price: initialData.purchaseInfo?.price?.toString() || '',
          date: initialData.purchaseInfo?.date?.slice(0, 10) || '',
          warranty: initialData.purchaseInfo?.warranty?.slice(0, 10) || '',
        },
      };
    }
    return {
      name: '',
      category: '',
      specifications: [
        { key: '', value: '' },
      ],
      condition: 'Baik',
      status: 'Tersedia',
      location: '',
      purchaseInfo: {
        price: '',
        date: '',
        warranty: '',
      },
      notes: '',
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('specifications.')) {
      // name: specifications.0.key or specifications.0.value
      const [, idx, field] = name.split('.');
      if (field === 'key' || field === 'value') {
        setForm((prev: typeof form) => {
          const specs = [...prev.specifications];
          specs[Number(idx)][field as 'key' | 'value'] = value;
          return { ...prev, specifications: specs };
        });
      }
    } else if (name.startsWith('purchaseInfo.')) {
      setForm((prev: typeof form) => ({
        ...prev,
        purchaseInfo: {
          ...prev.purchaseInfo,
          [name.replace('purchaseInfo.', '')]: value,
        },
      }));
    } else {
      setForm((prev: typeof form) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSpec = () => {
    setForm((prev: typeof form) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const handleRemoveSpec = (idx: number) => {
    setForm((prev: typeof form) => ({
      ...prev,
      specifications: prev.specifications.length > 1
        ? prev.specifications.filter((_ : unknown, i: number) => i !== idx)
        : prev.specifications,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit && onEditSubmit) {
        await onEditSubmit(form);
      } else {
        const specsObj: Record<string, string> = {};
        form.specifications.forEach(({ key, value }: any) => {
          if (key) specsObj[key] = value;
        });
        const payload = {
          ...form,
          specifications: specsObj,
          purchaseInfo: {
            ...form.purchaseInfo,
            price: Number(form.purchaseInfo.price),
          },
        };
        await addItem(payload);
        if (onSuccess) onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="" disabled>Select category</option>
                <option value="Hardware">Hardware</option>
                <option value="Peripheral">Peripheral</option>
                <option value="Development Tools">Development Tools</option>
                <option value="Software License">Software License</option>
                <option value="Lab Equipment">Lab Equipment</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
            <div className="space-y-2">
              {form.specifications.map((spec: { key: string; value: string }, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    name={`specifications.${idx}.key`}
                    value={spec.key}
                    onChange={handleChange}
                    placeholder="Key (e.g. brand, processor)"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <input
                    name={`specifications.${idx}.value`}
                    value={spec.value}
                    onChange={handleChange}
                    placeholder="Value (e.g. Dell, Intel i7)"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-red-500 hover:text-red-700 px-2"
                    disabled={form.specifications.length === 1}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSpec}
                className="mt-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                + Add Specification
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="" disabled>Select condition</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="Tersedia">Tersedia</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Dalam Perbaikan">Maintenance</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select name="location" value={form.location} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="" disabled>Select location</option>
                <option value="Lab 1">Lab 1</option>
                <option value="Lab 2">Lab 2</option>
                <option value="Lab 3">Lab 3</option>
                <option value="Gudang">Gudang</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input name="purchaseInfo.price" type="number" value={form.purchaseInfo.price} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input name="purchaseInfo.date" type="date" value={form.purchaseInfo.date} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Until</label>
              <input name="purchaseInfo.warranty" type="date" value={form.purchaseInfo.warranty} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {isEdit && editError && <div className="text-red-500 text-sm">{editError}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading || editLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {isEdit ? (editLoading ? 'Saving...' : 'Save Changes') : (loading ? 'Saving...' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 