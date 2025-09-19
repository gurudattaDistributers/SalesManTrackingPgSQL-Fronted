import React, { useState, useContext } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Shield, ArrowBack } from "@mui/icons-material";
import { loginSalesman } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SalesmanLogin = () => {
  const [salesmanPin, setPin] = useState("");
  const [salesmanPassword, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", severity: "error" });

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const showToast = (message, severity = "error") => {
    setToast({ open: true, message, severity });
  };
  const handleCloseToast = () => setToast({ ...toast, open: false });

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!salesmanPin) newErrors.salesmanPin = "Salesman PIN is required";
    if (!salesmanPassword) newErrors.salesmanPassword = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle login
  const handleLogin = async () => {
    if (!validate()) return;
    try {
      const res = await loginSalesman(salesmanPin, salesmanPassword);
      setUser(res.data);
      showToast("Login Successful", "success");
      setTimeout(() => navigate("/customer-form"), 1000);
    } catch (err) {
      console.error(err);
      showToast("Invalid PIN or Password", "error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #d8c16cff, #efa000ff)",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card elevation={6} sx={{ borderRadius: 3 }}>
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

            {/* Icon */}
            <Box textAlign="center" mb={2}>
              <Shield sx={{ fontSize: 48, color: "orange" }} />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
              color="orange"
            >
              Salesman Login
            </Typography>

            {/* Form */}
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Salesman PIN"
                variant="outlined"
                fullWidth
                value={salesmanPin}
                onChange={(e) => setPin(e.target.value)}
                error={!!errors.salesmanPin}
                helperText={errors.salesmanPin}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={salesmanPassword}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.salesmanPassword}
                helperText={errors.salesmanPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                  backgroundColor: "orange",
                  "&:hover": { backgroundColor: "#e68900" },
                }}
                onClick={handleLogin}
              >
                LOGIN
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar for feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesmanLogin;
