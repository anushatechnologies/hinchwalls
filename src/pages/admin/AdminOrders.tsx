import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Eye, CheckCircle2, Truck, Clock, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  itemsCount: number;
}

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    orderApi.getOrders().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setOrders(
          data.map((o: any, idx: number) => ({
            id: String(o.orderId || idx + 1),
            orderNumber: o.orderNumber || `#${o.orderId || 1000 + idx}`,
            customer: o.customerName || 'Customer',
            email: o.email || 'customer@example.com',
            total: o.totalAmount || o.amount || 0,
            status: o.status || 'Processing',
            date: o.createdAt ? o.createdAt.split('T')[0] : 'Today',
            itemsCount: o.itemsCount || 2,
          }))
        );
      }
    });
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchSearch =
      !searchTerm.trim() ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = (id: string, newStatus: AdminOrder['status']) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Track customer shipments, update fulfillment statuses, and print packing slips.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, customer, email..."
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-terracotta"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Processing', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'bg-stone-50 border border-stone-200 text-charcoal/70 hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-charcoal/70 uppercase font-bold tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50 transition">
                  <td className="p-4 font-mono font-bold text-charcoal">{ord.orderNumber}</td>
                  <td className="p-4">
                    <div className="font-semibold text-charcoal">{ord.customer}</div>
                    <div className="text-[11px] text-charcoal/50">{ord.email}</div>
                  </td>
                  <td className="p-4 text-charcoal/70">{ord.date}</td>
                  <td className="p-4 text-charcoal font-medium">{ord.itemsCount} decals</td>
                  <td className="p-4 font-serif font-bold text-charcoal">${ord.total.toFixed(2)}</td>
                  <td className="p-4">
                    <select
                      value={ord.status}
                      onChange={(e) => updateStatus(ord.id, e.target.value as AdminOrder['status'])}
                      className={`text-[11px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                        ord.status === 'Delivered'
                          ? 'bg-forest/10 border-forest/30 text-forest'
                          : ord.status === 'Shipped'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                          : 'bg-stone-100 border-stone-200 text-charcoal'
                      }`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toast('Printing packing slip for ' + ord.orderNumber)}
                        className="p-1.5 rounded-lg text-charcoal/70 hover:bg-stone-100 hover:text-charcoal"
                        title="Print Packing Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
