import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CategoriesProvider } from "./hooks/useCategories";
import { BudgetsProvider } from "./hooks/useBudgets";
import { TransactionsProvider } from "./hooks/useTransactions";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <CategoriesProvider>
      <BudgetsProvider>
        <TransactionsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="budget" element={<Budget />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </TransactionsProvider>
      </BudgetsProvider>
    </CategoriesProvider>
  );
}

export default App;
