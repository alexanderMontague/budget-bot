import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/Auth";
import { CategoriesProvider } from "./contexts/Categories";
import { BudgetsProvider } from "./contexts/Budgets";
import { TransactionsProvider } from "./contexts/Transactions";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CategoriesProvider>
                  <BudgetsProvider>
                    <TransactionsProvider>
                      <Layout />
                    </TransactionsProvider>
                  </BudgetsProvider>
                </CategoriesProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budget" element={<Budget />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
