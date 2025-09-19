import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import BillDetails from "./pages/BillDetails";
import NewBill from "./pages/NewBill";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Categories from "./pages/Categories";
import AppSettings from "./pages/AppSettings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Route path="/" component={Index} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/bills" component={Bills} />
        <Route path="/bills/new" component={NewBill} />
        <Route path="/bills/:id" component={BillDetails} />
        <Route path="/reports" component={Reports} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/edit" component={EditProfile} />
        <Route path="/profile/notifications" component={Notifications} />
        <Route path="/profile/security" component={Security} />
        <Route path="/profile/categories" component={Categories} />
        <Route path="/profile/settings" component={AppSettings} />
        <Route path="/profile/help" component={Help} />
        <Route path="/settings" component={Settings} />
        <Route path="/*" component={NotFound} />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
