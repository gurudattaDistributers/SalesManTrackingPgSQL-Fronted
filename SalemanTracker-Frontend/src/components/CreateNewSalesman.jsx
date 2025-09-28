import React, { useState } from "react";
import { createNewSalesman, createSalesmanImages } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const CreateNewSalesman = () => {
  const [formData, setFormData] = useState({
    salesmanName: "",
    salesmanEmail: "",
    salesmanPassword: "",
    confirmPassword: "",
    salesmanPhone: "",
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // ✅ Validation
  const validate = () => {
    let temp = {};

    if (!formData.salesmanName.trim()) temp.salesmanName = "Name is required";

    if (!formData.salesmanPhone) temp.salesmanPhone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.salesmanPhone))
      temp.salesmanPhone = "Phone must be 10 digits";

    if (!formData.salesmanPassword.trim()) {
      temp.salesmanPassword = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{6,}$/.test(
        formData.salesmanPassword
      )
    ) {
      temp.salesmanPassword =
        "Password must be at least 6 chars, include upper, lower, number & special char";
    }

    if (formData.salesmanPassword !== formData.confirmPassword) {
      temp.confirmPassword = "Passwords do not match";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const salesmanRes = await createNewSalesman(
        formData.salesmanName,
        formData.salesmanEmail,
        formData.salesmanPassword,
        formData.salesmanPhone
      );

      if (!salesmanRes.salesmanPin) {
        throw new Error("No salesmanPin returned from server");
      }

      if (images.length > 0) {
        await createSalesmanImages(salesmanRes.salesmanPin, images);
      }

      setSnackbar({
        open: true,
        message: "✅ Salesman created successfully!",
        severity: "success",
      });

      setTimeout(() => navigate("/salesman-info"), 1500);
    } catch (err) {
      console.error("Error creating salesman:", err);
      setSnackbar({
        open: true,
        message: "❌ Error creating salesman. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      {/* Top bar with Title + Back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          ➕ Create New Salesman
        </Typography>
        <IconButton onClick={() => navigate("/salesman-info")} color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Card elevation={4}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="salesmanName"
                  value={formData.salesmanName}
                  onChange={handleChange}
                  error={!!errors.salesmanName}
                  helperText={errors.salesmanName}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="salesmanEmail"
                  value={formData.salesmanEmail}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="salesmanPhone"
                  value={formData.salesmanPhone}
                  onChange={handleChange}
                  error={!!errors.salesmanPhone}
                  helperText={errors.salesmanPhone}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="salesmanPassword"
                  value={formData.salesmanPassword}
                  onChange={handleChange}
                  error={!!errors.salesmanPassword}
                  helperText={errors.salesmanPassword}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>


                            <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>


              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  📷 Upload Images
                </Typography>
                <input type="file" multiple onChange={handleImageChange} />
                <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                  {images.map((file, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        width: 110,
                        textAlign: "center",
                      }}
                      elevation={2}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ py: 1.5 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? "Creating..." : "Create Salesman"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateNewSalesman;
