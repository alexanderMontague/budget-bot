import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CategoriesProvider } from "./contexts/Categories";
import { BudgetsProvider } from "./contexts/Budgets";
import { TransactionsProvider } from "./contexts/Transactions";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
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
                <Route path="transactions" element={<Transactions />} />
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
