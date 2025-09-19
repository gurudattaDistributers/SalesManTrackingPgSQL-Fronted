import React, { useState, useContext } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { loginAdmin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBack from "@mui/icons-material/ArrowBack";

const AdminLogin = () => {
  const [adminUserName, setAdminUserName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      setError("");
      const res = await loginAdmin(adminUserName, adminPassword);
      setUser(res.data);
      navigate("/admin-dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d8c16cff, #efa000ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ boxShadow: 5, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Back Button */}
            <Box display="flex" justifyContent="flex-start" mb={2}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/login")}
                sx={{ textTransform: "none", fontWeight: "bold" }}
              >
                Back
              </Button>
            </Box>

            {/* Icon + Title */}
            <Box textAlign="center" mb={2}>
              <AdminPanelSettingsIcon
                sx={{ fontSize: 50, color: "orange", mb: 1 }}
              />
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "orange" }}
              >
                Admin Login
              </Typography>
            </Box>

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Admin Username"
                variant="outlined"
                fullWidth
                value={adminUserName}
                onChange={(e) => setAdminUserName(e.target.value)}
                required
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: "orange",
                  "&:hover": { backgroundColor: "#e68900" },
                  fontWeight: "bold",
                }}
                onClick={handleLogin}
              >
                Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLogin;
