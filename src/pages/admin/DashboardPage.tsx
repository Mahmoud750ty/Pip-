import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FaBoxOpen, FaChartBar, FaMoneyBill, FaExclamationTriangle } from 'react-icons/fa';
import type { Order, Product } from '../../types';

// Define a more specific type for analytics data
interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  mostOrdered: { name: string; quantity: number }[];
}

// Define the type for items within an order for better type safety


// Augment the Order type to ensure createdAt is a Timestamp
interface DashboardOrder extends Omit<Order, 'createdAt'> {
  createdAt: Timestamp;
}

const timeFilters = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

function getTimestampRange(filter: string) {
  const now = new Date();
  let start: Date;
  const end = now; // Corrected: Initialized 'end' once

  switch (filter) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week': {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '6months':
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(0); // For 'all time', start from the beginning
  }
  return { start, end };
}

const DashboardPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    mostOrdered: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  // Fetch orders when filter changes
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const qRef = collection(db, 'orders');
      let qFinal;
      if (timeFilter !== 'all') {
        const { start, end } = getTimestampRange(timeFilter);
        qFinal = query(qRef, where('createdAt', '>=', start), where('createdAt', '<=', end), orderBy('createdAt', 'desc'));
      } else {
        qFinal = query(qRef, orderBy('createdAt', 'desc'));
      }
      try {
        const snap = await getDocs(qFinal);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DashboardOrder)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [timeFilter]);

  // Fetch all products for low stock alerts (runs once)
  useEffect(() => {
    const fetchProducts = async () => {
      const allCollections = [
        'smokes', 'snack-attack', 'candy-boom',
        'super-nuts', 'vibe-save', 'game-on',
      ];
      const allProducts: Product[] = [];
      for (const col of allCollections) {
        const snap = await getDocs(collection(db, col));
        allProducts.push(...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      }
      // Removed the 'products' state as it's not used elsewhere
      setLowStock(allProducts.filter(p => p.stock > 0 && p.stock <= 5));
    };
    fetchProducts();
  }, []);

  // Process analytics when orders change
  useEffect(() => {
    // Only include non-WhatsApp orders in totalRevenue
    let totalRevenue = 0;
    const totalOrders = orders.length;
    const productPopularity: Record<string, { name: string; quantity: number }> = {};

    orders.forEach(order => {
      if (order.type !== 'WhatsApp') {
        totalRevenue += order.total;
      }
      order.items.forEach(item => {
        if (!productPopularity[item.productId]) {
          productPopularity[item.productId] = { name: item.name, quantity: 0 };
        }
        productPopularity[item.productId].quantity += item.quantity;
      });
    });

    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const mostOrdered = Object.values(productPopularity)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      mostOrdered,
    });
  }, [orders]);

  // Split orders by type
  const guestOrders = orders.filter(o => o.type === 'WhatsApp');
  const cashierOrders = orders.filter(o => o.type === 'Cashier');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        {timeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setTimeFilter(f.value)}
            className={`px-4 py-2 rounded ${timeFilter === f.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading dashboard data...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaMoneyBill className="text-green-500 text-2xl mr-4" />
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-800">EGP {analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaBoxOpen className="text-primary text-2xl mr-4" />
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-xl font-semibold text-gray-800">{analytics.totalOrders}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaChartBar className="text-blue-500 text-2xl mr-4" />
              <div>
                <p className="text-sm text-gray-500">Avg. Order Value</p>
                <p className="text-xl font-semibold text-gray-800">EGP {analytics.avgOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-center mb-2 text-yellow-800 font-bold"><FaExclamationTriangle className="mr-2" />Low Stock Alerts</div>
              <ul className="ml-6 list-disc">
                {lowStock.map(p => (
                  <li key={p.id}>{p.name} (Stock: {p.stock})</li>
                ))}
              </ul>
            </div>
          )}
          {/* Most Ordered Products */}
          <div className="mb-8  bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Top 5 Most Ordered Products</h2>
            {analytics.mostOrdered.length > 0 ? (
              <ul className="ml-6 list-decimal">
                {analytics.mostOrdered.map((p: { name: string; quantity: number }, idx: number) => (
                  <li key={idx}>{p.name} ({p.quantity} sold)</li>
                ))}
              </ul>
            ) : (<p className="text-gray-500">No product data for this period.</p>)}
          </div>
          {/* Recent Orders Table - Cashier/Admin */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Admin/Cashier Orders</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Items</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Cashier</th>
                </tr>
              </thead>
              <tbody>
                {cashierOrders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2">{order.id}</td>
                    <td className="py-2">{order.customerName}</td>
                    <td className="py-2">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</td>
                    <td className="py-2">
                      <ul>
                        {order.items.map((item: any, idx: number) => (
                          <li key={idx}>{item.name} x{item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2">EGP {order.total}</td>
                    <td className="py-2">{order.cashierName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Recent Orders Table - Guests */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Guest Orders (WhatsApp)</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Items</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {guestOrders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2">{order.id}</td>
                    <td className="py-2">{order.customerName}</td>
                    <td className="py-2">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</td>
                    <td className="py-2">
                      <ul>
                        {order.items.map((item: any, idx: number) => (
                          <li key={idx}>{item.name} x{item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2">EGP {order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </>
      )}
    </div>
  );
};

export default DashboardPage;