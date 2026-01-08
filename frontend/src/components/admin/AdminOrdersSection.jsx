import { useState } from "react";

const STATUSES = ["pending", "paid", "cancelled", "shipped"];

export function AdminOrdersSection({ orders, onUpdateStatus }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by status:</label>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-3 py-1.5 rounded appearance-none pr-8 cursor-pointer bg-white focus:outline-none"
            >
              <option value="all">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <svg 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-1 border-b-stone-300">
            <th>ID</th>
            <th>User</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr 
              key={o.id} 
              className="border-b-1 border-b-stone-300 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedOrder(o)}
            >
              <td className="p-2">{o.id}</td>
              <td className="p-2">{o.user_email}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">{o.total_amount} PLN</td>
              <td className="p-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative inline-block">
                  <select
                    value={o.status}
                    onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                    className="block bg-transparent appearance-none px-2 py-1 border-b-1 pr-8 cursor-pointer focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Order #{selectedOrder.id}</h3>
                <p className="text-sm text-gray-600">Created at: {selectedOrder.created_at}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{selectedOrder.user_email || 'No data'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-lg">{selectedOrder.total_amount} PLN</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium">{selectedOrder.user_id}</p>
                </div>
              </div>

              <div className="border-t-1 border-t-stone-300 pt-4">
                <h4 className="font-semibold mb-3">Products in Order</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="">
                      <tr>
                        <th className="text-left p-2">Product</th>
                        <th className="text-center p-2">Qty</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-t-1 border-t-stone-300">
                          <td className="p-2">{item.product_name || `ID: ${item.product_id}`}</td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="text-right p-2">{item.price_at_purchase.toFixed(2)} PLN</td>
                          <td className="text-right p-2">{item.subtotal.toFixed(2)} PLN</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-600">No products in order</p>
                )}
              </div>

              <div className="border-t-1 border-t-stone-300 pt-4">
                <h4 className="font-semibold mb-2">Change Status</h4>
                <div className="relative">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      onUpdateStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
                    className="w-full block bg-transparent appearance-none px-3 py-1 border-b-1 pr-8 cursor-pointer focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300 px-3 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
