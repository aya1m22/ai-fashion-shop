import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Women from "./pages/Women";
import Men from "./pages/Men";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import AIStylist from "./pages/AIStylist";
import AdminDashboard from "./pages/AdminDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./lib/trpc";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";

function Router() {
  // Use Vite's base path (e.g., /ai-fashion-shop/) for routing
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/women" component={Women} />
        <Route path="/men" component={Men} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/profile" component={Profile} />
        <Route path="/ai-stylist" component={AIStylist} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: (import.meta.env.VITE_API_URL || "") + "/api/trpc",
          async fetch(url, options) {
            try {
              const response = await fetch(url, options);
              const contentType = response.headers.get("content-type");
              
              // If we get HTML instead of JSON, the backend is likely missing (e.g. GitHub Pages 404)
              if (contentType && contentType.includes("text/html")) {
                console.warn("tRPC: Received HTML instead of JSON. Backend might be missing. Using fallback/error state.");
                throw new Error("API_NOT_FOUND");
              }
              
              return response;
            } catch (err) {
              console.error("tRPC Fetch Error:", err);
              throw err;
            }
          },
          headers() {
            const savedUser = localStorage.getItem('styleai_user');
            if (savedUser) {
              try {
                const user = JSON.parse(savedUser);
                if (user && user.email) {
                  return { 'x-user-email': user.email };
                }
              } catch (e) {}
            }
            return {};
          }
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="light">
            <CartProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster position="bottom-right" />
                  <Router />
                </TooltipProvider>
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
