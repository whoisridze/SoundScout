import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";
import {
  Landing,
  HowItWorks,
  Contact,
  Login,
  Register,
  Dashboard,
  Subgenres,
  Artists,
  ArtistDetail,
  Profile,
  PublicProfile,
  Settings,
  NotFound,
} from "./pages";
import { AuthProvider, AudioPlayerProvider } from "./contexts";
import { ProtectedRoute, AdminRoute, ErrorBoundary } from "./components";
import { AudioPlayer } from "./components/discovery";
import { AppLayout } from "./layouts";
import { QueryProvider } from "./providers";

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

// Placeholder pages (to be implemented in Phase 4)
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

// App layout with audio player
function AppLayoutWithPlayer() {
  return (
    <AudioPlayerProvider>
      <AppLayout />
      <AudioPlayer />
    </AudioPlayerProvider>
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
            element: <AppLayoutWithPlayer />,
            children: [
              { path: "/dashboard", element: <Dashboard /> },
              { path: "/profile", element: <Profile /> },
              { path: "/settings", element: <Settings /> },
              { path: "/user/:username", element: <PublicProfile /> },
              { path: "/genre/:genreId", element: <Subgenres /> },
              { path: "/genre/:genreId/:subgenre", element: <Artists /> },
              { path: "/artist/:artistId", element: <ArtistDetail /> },
            ],
          },
        ],
      },

      // Admin routes
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AppLayoutWithPlayer />,
            children: [
              { path: "/admin", element: <AdminDashboard /> },
              { path: "/admin/users", element: <AdminUsers /> },
              { path: "/admin/comments", element: <AdminComments /> },
            ],
          },
        ],
      },

      // 404 catch-all
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
