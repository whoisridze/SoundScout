import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";
import { Landing, HowItWorks, Contact, Login, Register } from "./pages";
import { AuthProvider } from "./contexts";
import { ProtectedRoute, AdminRoute } from "./components";
import { AppLayout } from "./layouts";

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

// Placeholder pages (to be implemented in Phase 2+)
function Dashboard() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Explore Genres</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

function Favorites() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Your Favorites</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

function Profile() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

function AdminUsers() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Manage Users</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

function AdminComments() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary">Manage Comments</h1>
      <p className="text-text-secondary mt-2">Coming soon...</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes
      { path: "/", element: <Landing /> },
      { path: "/how-it-works", element: <HowItWorks /> },
      { path: "/contact", element: <Contact /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      // Protected routes (authenticated users)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/dashboard", element: <Dashboard /> },
              { path: "/favorites", element: <Favorites /> },
              { path: "/profile", element: <Profile /> },
              { path: "/settings", element: <Settings /> },
              { path: "/genre/:genreId", element: <div>Genre Page</div> },
              { path: "/genre/:genreId/:subgenre", element: <div>Artists Page</div> },
              { path: "/artist/:artistId", element: <div>Artist Page</div> },
            ],
          },
        ],
      },

      // Admin routes
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/admin", element: <AdminDashboard /> },
              { path: "/admin/users", element: <AdminUsers /> },
              { path: "/admin/comments", element: <AdminComments /> },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
