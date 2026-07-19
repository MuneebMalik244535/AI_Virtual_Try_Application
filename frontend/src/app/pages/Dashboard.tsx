import { Link } from 'react-router';
import { User, Package, MapPin, Heart, LogOut, Settings } from 'lucide-react';

export function Dashboard() {
  const userStats = {
    totalOrders: 12,
    activeOrders: 2,
    wishlistItems: 8,
    savedAddresses: 3,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-neutral-200">
              <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
                <User className="w-8 h-8 text-neutral-600" />
              </div>
              <div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-sm text-neutral-600">john@example.com</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-md bg-neutral-100 font-medium"
              >
                <User className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/order-history"
                className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <Package className="w-5 h-5" />
                <span>Orders</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </Link>
              <Link
                to="/addresses"
                className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Addresses</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-neutral-100 transition-colors text-red-600">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <Package className="w-8 h-8 mb-3 text-neutral-600" />
              <p className="text-2xl font-bold mb-1">{userStats.totalOrders}</p>
              <p className="text-sm text-neutral-600">Total Orders</p>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <Package className="w-8 h-8 mb-3 text-blue-600" />
              <p className="text-2xl font-bold mb-1">{userStats.activeOrders}</p>
              <p className="text-sm text-neutral-600">Active Orders</p>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <Heart className="w-8 h-8 mb-3 text-red-600" />
              <p className="text-2xl font-bold mb-1">{userStats.wishlistItems}</p>
              <p className="text-sm text-neutral-600">Wishlist Items</p>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <MapPin className="w-8 h-8 mb-3 text-green-600" />
              <p className="text-2xl font-bold mb-1">{userStats.savedAddresses}</p>
              <p className="text-sm text-neutral-600">Saved Addresses</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link to="/order-history" className="text-sm text-black hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((order) => (
                <div
                  key={order}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-md bg-neutral-100" />
                    <div>
                      <p className="font-medium">Order #{1000 + order}</p>
                      <p className="text-sm text-neutral-600">
                        Placed on March {order}, 2026
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        ${(99.99 * order).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-2">
                      Delivered
                    </span>
                    <br />
                    <Link
                      to={`/order/${1000 + order}`}
                      className="text-sm text-black hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/shop"
              className="bg-black text-white rounded-lg p-6 hover:bg-neutral-800 transition-colors"
            >
              <h3 className="font-semibold mb-2">Continue Shopping</h3>
              <p className="text-sm text-neutral-300">Discover new products</p>
            </Link>
            <Link
              to="/wishlist"
              className="bg-white border border-neutral-200 rounded-lg p-6 hover:bg-neutral-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">View Wishlist</h3>
              <p className="text-sm text-neutral-600">
                {userStats.wishlistItems} items saved
              </p>
            </Link>
            <Link
              to="/order-history"
              className="bg-white border border-neutral-200 rounded-lg p-6 hover:bg-neutral-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">Track Orders</h3>
              <p className="text-sm text-neutral-600">
                {userStats.activeOrders} orders in transit
              </p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
