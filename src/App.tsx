import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Bills from "@/pages/Bills";
import BillDetails from "@/pages/BillDetails";
import NewBill from "@/pages/NewBill";
import EditBill from "@/pages/EditBill";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Security from "@/pages/Security";
import Categories from "@/pages/Categories";
import AppSettings from "@/pages/AppSettings";
import Help from "@/pages/Help";
import DataManagement from "@/pages/DataManagement";
import NotFound from "@/pages/NotFound";


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/bills">
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          </Route>
          <Route path="/bills/new">
            <ProtectedRoute>
              <NewBill />
            </ProtectedRoute>
          </Route>
          <Route path="/bills/:id/edit">
            <ProtectedRoute>
              <EditBill />
            </ProtectedRoute>
          </Route>
          <Route path="/bills/:id">
            <ProtectedRoute>
              <BillDetails />
            </ProtectedRoute>
          </Route>
          <Route path="/reports">
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/profile/edit">
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          </Route>
          <Route path="/profile/notifications">
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          </Route>
          <Route path="/profile/security">
            <ProtectedRoute>
              <Security />
            </ProtectedRoute>
          </Route>
          <Route path="/profile/categories">
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          </Route>
          <Route path="/categories">
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          </Route>
          <Route path="/profile/settings">
            <ProtectedRoute>
              <AppSettings />
            </ProtectedRoute>
          </Route>
          <Route path="/profile/help">
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          <Route path="/data-management">
            <ProtectedRoute>
              <DataManagement />
            </ProtectedRoute>
          </Route>
          <Route><NotFound /></Route>
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;