import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/Home";
import CreateEventPage from "./pages/CreateSecretSanta";
import AdminPage from "./pages/Admin";
import RevealPage from "./pages/Reveal";
import NotFoundPage from "./pages/NotFound";
import CreatedPage from "./pages/Created";
import SecretSantaPage from "./pages/SecretSanta";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,       
    children: [
      { index: true, element: <HomePage /> },
      { path: "create", element: <CreateEventPage /> },
      { path: "created/:id", element: <CreatedPage /> },
      { path: "secret-santa/:id", element: <SecretSantaPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "reveal/:id/:name", element: <RevealPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);