import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Exercises from "./pages/Exercises";
import NotFound from "./pages/NotFound";
// Psychologist pages
import PsychologistLogin from "./pages/psychologist/PsychologistLogin";
import PsychologistSignup from "./pages/psychologist/PsychologistSignup";
import PsychologistDashboard from "./pages/psychologist/PsychologistDashboard";
import PsychologistSchedule from "./pages/psychologist/PsychologistSchedule";
import PsychologistClients from "./pages/psychologist/PsychologistClients";
import PsychologistSettings from "./pages/psychologist/PsychologistSettings";
// Consultation pages
import FindPsychologists from "./pages/consultations/FindPsychologists";
import BookAppointment from "./pages/consultations/BookAppointment";
import MyAppointments from "./pages/consultations/MyAppointments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/exercises" element={<Exercises />} />
          {/* Consultation routes for clients */}
          <Route path="/consultations" element={<FindPsychologists />} />
          <Route path="/consultations/book/:id" element={<BookAppointment />} />
          <Route path="/appointments" element={<MyAppointments />} />
          {/* Psychologist portal routes */}
          <Route path="/psychologist/login" element={<PsychologistLogin />} />
          <Route path="/psychologist/signup" element={<PsychologistSignup />} />
          <Route path="/psychologist/dashboard" element={<PsychologistDashboard />} />
          <Route path="/psychologist/schedule" element={<PsychologistSchedule />} />
          <Route path="/psychologist/clients" element={<PsychologistClients />} />
          <Route path="/psychologist/settings" element={<PsychologistSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
