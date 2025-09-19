import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateCustomer,
  getAllCustomers,
  getCustomerImages,
  deleteCustomerimages,
  uploadCustomerImages,
} from "../services/authService";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import DownloadIcon from "@mui/icons-material/Download";

const CustomerUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    CustomerId: parseInt(id),
    CustomerName: "",
    ShopName: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CustomerAddress: "",
    CustomerOrderStatus: "Pending",
    CustomerVerificationStatus: "Unverified",
    CustomerOrderDetails: "",
    SalesmanPin: "",
  });

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [newImages, setNewImages] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const res = await getAllCustomers();
        const customer = res.data.find((c) => c.customerId === parseInt(id));
        if (customer) {
          setFormData({
            CustomerId: customer.customerId,
            CustomerName: customer.customerName || "",
            ShopName: customer.shopName || "",
            CustomerEmail: customer.customerEmail || "",
            CustomerPhone: customer.customerPhone || "",
            CustomerAddress: customer.customerAddress || "",
            CustomerOrderStatus: customer.customerOrderStatus || "Pending",
            CustomerVerificationStatus:
              customer.customerVerificationStatus || "Unverified",
            CustomerOrderDetails: customer.customerOrderDetails || "",
            SalesmanPin: customer.salesmanPin || "",
          });
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    const fetchImages = async () => {
      try {
        const res = await getCustomerImages(id);
        setImages(res.data || []);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchCustomerData();
    fetchImages();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.CustomerPhone)) {
      setSnackbar({
        open: true,
        message: "Mobile number must be 10 digits",
        severity: "error",
      });
      return;
    }

    try {
      await updateCustomer(formData);

      if (newImages.length > 0) {
        const formDataObj = new FormData();
        newImages.forEach((file) => {
          formDataObj.append("images", file);
        });
        formDataObj.append("customerId", formData.CustomerId);
        await uploadCustomerImages(formDataObj);
      }

      setSnackbar({
        open: true,
        message: "Customer updated successfully",
        severity: "success",
      });
      setTimeout(() => navigate("/customer-info"), 1500);
    } catch (error) {
      console.error("Update failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to update customer",
        severity: "error",
      });
    }
  };

  const handleDeleteImage = async (customerImageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteCustomerimages(customerImageId);
      setImages((prev) =>
        prev.filter((img) => img.customerImageId !== customerImageId)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleDownload = (url) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "customer-image.jpg";
        link.click();
      });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      {/* Heading */}
      <Typography
        variant="h3"
        align="center"
        sx={{ color: "orange", fontWeight: "bold", mb: 3 }}
      >
        UPDATE CUSTOMER
      </Typography>

      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              name="CustomerName"
              label="Customer Name"
              value={formData.CustomerName}
              onChange={handleChange}
              required
            />
            <TextField
              name="ShopName"
              label="Shop Name"
              value={formData.ShopName}
              onChange={handleChange}
              required
            />
            <TextField
              name="CustomerEmail"
              label="Email"
              value={formData.CustomerEmail}
              onChange={handleChange}
            />
            <TextField
              name="CustomerPhone"
              label="Phone"
              value={formData.CustomerPhone}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              name="CustomerAddress"
              label="Address"
              value={formData.CustomerAddress}
              onChange={handleChange}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Order Status</InputLabel>
              <Select
                name="CustomerOrderStatus"
                value={formData.CustomerOrderStatus}
                onChange={handleChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Verification Status</InputLabel>
              <Select
                name="CustomerVerificationStatus"
                value={formData.CustomerVerificationStatus}
                onChange={handleChange}
              >
                <MenuItem value="Unverified">Unverified</MenuItem>
                <MenuItem value="Verified">Verified</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="CustomerOrderDetails"
              label="Order Details"
              multiline
              rows={3}
              value={formData.CustomerOrderDetails}
              onChange={handleChange}
            />
            <TextField
              name="SalesmanPin"
              label="Salesman PIN"
              value={formData.SalesmanPin}
              onChange={handleChange}
              required
            />

            {/* Existing Images */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Customer Images
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {images.map((img) => (
                <Box key={img.customerImageId} sx={{ position: "relative" }}>
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "rgba(255,255,255,0.8)",
                    }}
                    onClick={() => handleDeleteImage(img.customerImageId)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <img
                    src={img.imageUrl}
                    alt="Customer"
                    width={100}
                    height={100}
                    style={{ objectFit: "cover", cursor: "pointer" }}
                    onClick={() => setSelectedImage(img)}
                  />
                </Box>
              ))}
            </Box>

            {/* Upload New Images */}
            <Button variant="outlined" component="label">
              Upload New Images
              <input
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setNewImages((prev) => [...prev, ...files]);
                }}
              />
            </Button>

            {/* Preview */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {newImages.map((file, idx) => (
                <Box key={idx} sx={{ position: "relative" }}>
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "rgba(255,255,255,0.8)",
                    }}
                    onClick={() =>
                      setNewImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Box>

            {/* Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/customer-info")}
              >
                Back
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Full Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
      >
        <DialogContent sx={{ textAlign: "center" }}>
          {selectedImage && (
            <>
              <Box sx={{ mb: 2 }}>
                <IconButton onClick={() => setZoomLevel((p) => p + 0.2)}>
                  <ZoomInIcon />
                </IconButton>
                <IconButton
                  onClick={() => setZoomLevel((p) => Math.max(1, p - 0.2))}
                >
                  <ZoomInIcon sx={{ transform: "rotate(180deg)" }} />
                </IconButton>
                <IconButton
                  onClick={() => handleDownload(selectedImage.imageUrl)}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
              <img
                src={selectedImage.imageUrl}
                alt="Full"
                style={{
                  maxWidth: "100%",
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.2s ease",
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerUpdate;
