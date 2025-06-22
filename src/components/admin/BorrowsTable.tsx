import { Borrow } from '@/models/borrow';
import { formatDate } from '@/utils/format';
import { updateBorrowApproval } from '@/services/borrows';
import React, { useState } from 'react';

interface BorrowsTableProps {
  borrows: Borrow[];
  isLoading: boolean;
  onStatusUpdate: (borrowId: string, status: 'borrowed' | 'returned' | 'rejected') => void;
}

export default function BorrowsTable({ borrows, isLoading, onStatusUpdate }: BorrowsTableProps) {
  const renderStatus = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      borrowed: 'bg-blue-100 text-blue-800',
      returned: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    } as const;

    const style = statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const [modal, setModal] = useState<{
    type: 'approve' | 'reject' | null;
    borrowId: string | null;
  }>({ type: null, borrowId: null });
  const [returnCondition, setReturnCondition] = useState('Baik');
  const [returnNotes, setReturnNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (!modal.borrowId) return;
    setLoading(true);
    setError('');
    try {
      await updateBorrowApproval(modal.borrowId, 'approved', returnCondition, returnNotes);
      setModal({ type: null, borrowId: null });
      setReturnCondition('Baik');
      setReturnNotes('');
      onStatusUpdate(modal.borrowId, 'borrowed');
    } catch (err: any) {
      setError(err.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!modal.borrowId) return;
    setLoading(true);
    setError('');
    try {
      await updateBorrowApproval(modal.borrowId, 'rejected');
      setModal({ type: null, borrowId: null });
      onStatusUpdate(modal.borrowId, 'rejected');
    } catch (err: any) {
      setError(err.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (borrows.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>No borrow requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Borrow Code
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {borrows.map((borrow) => (
            <tr key={borrow._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{borrow.borrowCode}</div>
                <div className="text-sm text-gray-500">{formatDate(borrow.borrowDate)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{borrow.user.name}</div>
                <div className="text-sm text-gray-500">{borrow.user.class}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {borrow.items.map((item, index) => (
                    <div key={item._id} className="mb-1">
                      {item.item ? (
                        <>
                          <span className="font-medium">{item.item.name}</span>
                          <span className="text-gray-500"> - {item.condition}</span>
                          {item.notes && <span className="text-gray-500"> ({item.notes})</span>}
                        </>
                      ) : (
                        <span className="text-red-500">Item not found</span>
                      )}
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(borrow.dueDate)}</div>
                <div className="text-sm text-gray-500">{borrow.duration} days</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderStatus(borrow.status)}
                {borrow.isLate && (
                  <span className="ml-2 text-xs text-red-600 font-medium">LATE</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {borrow.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setModal({ type: 'approve', borrowId: borrow._id })}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setModal({ type: 'reject', borrowId: borrow._id })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {borrow.status === 'borrowed' && (
                  <button
                    onClick={() => onStatusUpdate(borrow._id, 'returned')}
                    className="text-green-600 hover:text-green-900"
                  >
                    Mark as Returned
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative border border-gray-200">
            <button onClick={() => setModal({ type: null, borrowId: null })} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-2xl leading-none">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">{modal.type === 'approve' ? 'Approve Borrow Request' : 'Reject Borrow Request'}</h2>
            {modal.type === 'approve' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Condition</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                    value={returnCondition}
                    onChange={e => setReturnCondition(e.target.value)}
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Notes (optional)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setModal({ type: null, borrowId: null })} className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300">Cancel</button>
                  <button onClick={handleApprove} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {loading ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 text-gray-900">Are you sure you want to reject this borrow request?</div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setModal({ type: null, borrowId: null })} className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300">Cancel</button>
                  <button onClick={handleReject} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    {loading ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 