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
  AdminDashboard,
  AdminUsers,
  AdminComments,
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
