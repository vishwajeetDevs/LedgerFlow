import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import CreateRecord from "./pages/CreateRecord";
import EditRecord from "./pages/EditRecord";
import Users from "./pages/Users";
import Documentation from "./pages/Documentation";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ToastContainer from "./components/Toast";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />

          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}><Dashboard /></ProtectedRoute>
          } />

          <Route path="records" element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}><Records /></ProtectedRoute>
          } />
          <Route path="records/create" element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}><CreateRecord /></ProtectedRoute>
          } />
          <Route path="records/edit/:id" element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}><EditRecord /></ProtectedRoute>
          } />

          <Route path="users" element={
            <ProtectedRoute allowedRoles={[2, 3]}><Users /></ProtectedRoute>
          } />

          <Route path="docs" element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}><Documentation /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
