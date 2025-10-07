import { Outlet, NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Transactions", href: "/transactions", icon: "💳" },
  { name: "Budget", href: "/budget", icon: "💰" },
  { name: "Reports", href: "/reports", icon: "📈" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header
        className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0"
        style={{ height: "var(--header-height)" }}
      >
        <div className="container">
          <div className="flex-between h-full">
            <div className="flex-start">
              <h1 className="heading-1">Budget Tracker</h1>
            </div>
            <nav className="hide-mobile space-x-8">
              {navigation.map(item => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    isActive ? "nav-link-active" : "nav-link-inactive"
                  }
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav
        className="show-mobile fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50"
        style={{ height: "var(--nav-mobile-height)" }}
      >
        <div className={`grid grid-cols-5 h-full w-full`}>
          {navigation.map(item => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                isActive ? "nav-mobile-link-active" : "nav-mobile-link-inactive"
              }
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="font-medium text-xs">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
