import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSalesmanImage,
  updateSalesman,
  deleteSalesmanImages,
  createSalesmanImages,
  getAllSalesman,
} from "../services/authService";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  IconButton,
  Container,
  Divider,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SalesmanEdit = () => {
  const { pin } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salesmanPin: "",
    salesmanName: "",
    salesmanEmail: "",
    salesmanPassword: "",
    confirmPassword: "",
    salesmanPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    imageId: null,
  });

  // Load salesman details & images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allSalesmen = await getAllSalesman();
        const salesman = (allSalesmen.data || allSalesmen).find(
          (s) => s.salesmanPin === pin
        );

        if (salesman) {
          setFormData({
            salesmanPin: salesman.salesmanPin,
            salesmanName: salesman.salesmanName,
            salesmanEmail: salesman.salesmanEmail || "",
            salesmanPassword: "",
            confirmPassword: "",
            salesmanPhone: salesman.salesmanPhone,
          });
        }

        const images = await getSalesmanImage(pin);
        setExistingImages(images || []);
      } catch (err) {
        console.error("Error loading salesman data", err);
        setToast({ open: true, message: "Failed to load salesman data", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pin]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Validation
  const validate = () => {
    let temp = {};

    if (!formData.salesmanName.trim()) temp.salesmanName = "Name is required";

    if (!formData.salesmanPhone)
      temp.salesmanPhone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.salesmanPhone))
      temp.salesmanPhone = "Phone must be 10 digits";

    if (formData.salesmanPassword.trim()) {
      if (
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
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleNewImages = (e) => {
    setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDeleteImage = async () => {
    try {
      await deleteSalesmanImages(confirmDialog.imageId);
      setExistingImages((prev) =>
        prev.filter((img) => img.salesmanImageId !== confirmDialog.imageId)
      );
      setToast({ open: true, message: "Image deleted successfully", severity: "success" });
    } catch (err) {
      console.error("Failed to delete image", err);
      setToast({ open: true, message: "Failed to delete image", severity: "error" });
    } finally {
      setConfirmDialog({ open: false, imageId: null });
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        salesmanPin: formData.salesmanPin,
        salesmanName: formData.salesmanName,
        salesmanEmail: formData.salesmanEmail,
        salesmanPhone: formData.salesmanPhone,
      };

      if (formData.salesmanPassword.trim()) {
        payload.salesmanPassword = formData.salesmanPassword.trim();
      }

      await updateSalesman(payload);

      if (newImages.length > 0) {
        await createSalesmanImages(formData.salesmanPin, newImages);
      }

      setToast({ open: true, message: "Salesman updated successfully!", severity: "success" });

      // Redirect after short delay so toast shows
      setTimeout(() => {
        navigate("/salesman-info");
      }, 1500);
    } catch (err) {
      console.error("Failed to update salesman", err);
      setToast({ open: true, message: "Failed to update salesman", severity: "error" });
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          ✏️ Edit Salesman
        </Typography>
        <IconButton onClick={() => navigate("/salesman-info")} color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Card elevation={4}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salesman Name"
                  name="salesmanName"
                  value={formData.salesmanName}
                  onChange={handleChange}
                  error={!!errors.salesmanName}
                  helperText={errors.salesmanName}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="salesmanEmail"
                  value={formData.salesmanEmail}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="salesmanPassword"
                  value={formData.salesmanPassword}
                  onChange={handleChange}
                  error={!!errors.salesmanPassword}
                  helperText={
                    errors.salesmanPassword || "Leave empty to keep old password"
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📷 Existing Images
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                  {existingImages.length > 0 ? (
                    existingImages.map((img) => (
                      <Paper
                        key={img.salesmanImageId}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          position: "relative",
                          width: 110,
                          textAlign: "center",
                        }}
                        elevation={2}
                      >
                        <img
                          src={img.imageUrl}
                          alt="Salesman"
                          style={{
                            width: "100%",
                            height: "100px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() =>
                            setConfirmDialog({ open: true, imageId: img.salesmanImageId })
                          }
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            minWidth: "24px",
                            bgcolor: "error.main",
                            color: "white",
                            borderRadius: "50%",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                        >
                          ✖
                        </Button>
                      </Paper>
                    ))
                  ) : (
                    <Typography>No images found</Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  ➕ Upload New Images
                </Typography>
                <input type="file" multiple onChange={handleNewImages} />
                <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                  {newImages.map((file, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        position: "relative",
                        width: 110,
                        textAlign: "center",
                      }}
                      elevation={2}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New"
                        style={{
                          width: "100%",
                          height: "100px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => handleRemoveNewImage(index)}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          minWidth: "24px",
                          bgcolor: "grey.700",
                          color: "white",
                          borderRadius: "50%",
                          "&:hover": { bgcolor: "grey.900" },
                        }}
                      >
                        ✖
                      </Button>
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
                >
                  💾 Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, imageId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this image? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, imageId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalesmanEdit;
