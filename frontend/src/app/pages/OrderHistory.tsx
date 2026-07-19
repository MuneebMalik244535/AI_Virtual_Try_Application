import { Link } from 'react-router';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { products } from '../data/products';

export function OrderHistory() {
  const orders = [
    {
      id: '1001',
      date: '2026-03-01',
      status: 'Delivered' as const,
      total: 249.97,
      items: [
        { product: products[0], quantity: 2 },
        { product: products[1], quantity: 1 },
      ],
    },
    {
      id: '1002',
      date: '2026-02-25',
      status: 'In Transit' as const,
      total: 169.98,
      items: [
        { product: products[2], quantity: 1 },
        { product: products[3], quantity: 1 },
      ],
    },
    {
      id: '1003',
      date: '2026-02-20',
      status: 'Processing' as const,
      total: 299.99,
      items: [{ product: products[4], quantity: 1 }],
    },
    {
      id: '1004',
      date: '2026-02-15',
      status: 'Delivered' as const,
      total: 129.98,
      items: [
        { product: products[5], quantity: 1 },
        { product: products[6], quantity: 1 },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In Transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order History</h1>
        <p className="text-neutral-600">View and track all your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border border-neutral-200 overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-neutral-600">
                      Placed on {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="font-medium hover:underline block mb-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-neutral-600 mb-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-200">
                <Link
                  to={`/order/${order.id}`}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition-colors"
                >
                  View Details
                </Link>
                {order.status === 'In Transit' && (
                  <button className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition-colors">
                    Track Order
                  </button>
                )}
                {order.status === 'Delivered' && (
                  <>
                    <button className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-neutral-800 transition-colors">
                      Buy Again
                    </button>
                    <button className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition-colors">
                      Leave Review
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if needed) */}
      {orders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
          <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
          <p className="text-neutral-600 mb-8">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
