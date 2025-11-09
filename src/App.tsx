import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Customers from "./pages/Customers";
import CustomerStatementPage from "./pages/CustomerStatement";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseInvoice from "./pages/PurchaseInvoice";
import PurchaseReturn from "./pages/PurchaseReturn";
import CashSalesInvoice from "./pages/CashSalesInvoice";
import CreditSalesInvoice from "./pages/CreditSalesInvoice";
import DispatchOrders from "./pages/DispatchOrders";
import Quotations from "./pages/Quotations";
import QuotationsManagement from "./pages/QuotationsManagement";
import EditQuotation from "./pages/EditQuotation";
import { QuotationReport } from "./components/sales/QuotationReport";
import InvoicesManagement from "./pages/InvoicesManagement";
import InvoiceView from "./pages/InvoiceView";
import InvoiceEdit from "./pages/InvoiceEdit";
import ProductsDropdownMenu from "./components/products/ProductsDropdownMenu";
import CashDisbursement from "./pages/CashDisbursement";
import CashReceipt from "./pages/CashReceipt";
import CheckReceipt from "./pages/CheckReceipt";
import CheckDisbursement from "./pages/CheckDisbursement";
import ExpensesDisbursement from "./pages/ExpensesDisbursement";
import CustodyDisbursement from "./pages/CustodyDisbursement";
import CustodySettlement from "./pages/CustodySettlement";
import TreasuryManagement from "./pages/TreasuryManagement";
import CashReceiptsReport from "./pages/CashReceiptsReport";
import CashDisbursementsReport from "./pages/CashDisbursementsReport";
import CheckReceiptsReport from "./pages/CheckReceiptsReport";
import CheckDisbursementsReport from "./pages/CheckDisbursementsReport";
import ExpensesDisbursementsReport from "./pages/ExpensesDisbursementsReport";
import CustodyDisbursementsReport from "./pages/CustodyDisbursementsReport";
import CustodySettlementsReport from "./pages/CustodySettlementsReport";
import WarehouseDashboardPage from "./pages/WarehouseDashboard";
import WarehouseIncoming from "./pages/WarehouseIncoming";
import WarehouseOutgoing from "./pages/WarehouseOutgoing";
import WarehouseItemCard from "./pages/WarehouseItemCard";
import FinishedProductsManagementPage from "./pages/FinishedProductsManagement";
import TransactionReportPage from "./pages/TransactionReport";
import TransactionEditPage from "./pages/TransactionEdit";
import ProductsStockReportPage from "./pages/ProductsStockReport";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CashSalesInvoiceReport from "./pages/CashSalesInvoiceReport";
import CreditSalesInvoiceReport from "./pages/CreditSalesInvoiceReport";
import DueInvoicesReportPage from "./pages/DueInvoicesReport";
import CreditSalesInvoicesManagementPage from "./pages/CreditSalesInvoicesManagement";
import { MainLayout } from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with MainLayout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProductsDropdownMenu />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Customers />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-statement" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CustomerStatementPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase-orders"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PurchaseOrders />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase-invoice" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PurchaseInvoice />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase-return" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PurchaseReturn />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cash-sales-invoice" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CashSalesInvoice />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/credit-sales-invoice" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreditSalesInvoice />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dispatch-orders" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DispatchOrders />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Quotations />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations/manage" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QuotationsManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations/report/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QuotationReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations/edit/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditQuotation />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices/manage" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <InvoicesManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices/view/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <InvoiceView />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices/edit/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <InvoiceEdit />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cash-sales-invoice/report/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CashSalesInvoiceReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/credit-sales-invoice-report/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreditSalesInvoiceReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/due-invoices-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DueInvoicesReportPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/credit-sales-invoices-management" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreditSalesInvoicesManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route
              path="/treasury/cash-disbursement"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CashDisbursement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/cash-receipt" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CashReceipt />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/check-receipt" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CheckReceipt />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/check-disbursement" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CheckDisbursement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/expenses-disbursement" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExpensesDisbursement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/custody-disbursement" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CustodyDisbursement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/custody-settlement" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CustodySettlement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/management" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TreasuryManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/cash-receipts-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CashReceiptsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/cash-disbursements-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CashDisbursementsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/check-receipts-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CheckReceiptsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/check-disbursements-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CheckDisbursementsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/expenses-disbursements-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExpensesDisbursementsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/custody-disbursements-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CustodyDisbursementsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/treasury/custody-settlements-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CustodySettlementsReport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <WarehouseDashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/:type/incoming" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <WarehouseIncoming />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/:type/outgoing" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <WarehouseOutgoing />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/:type/item-card" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <WarehouseItemCard />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/finished-products/manage" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <FinishedProductsManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/transaction/:id/report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TransactionReportPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/transaction/:id/edit" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TransactionEditPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/warehouse/products-stock-report" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProductsStockReportPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
