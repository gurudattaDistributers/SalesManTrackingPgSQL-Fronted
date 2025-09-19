import React, { useState } from "react";
import {
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Divider,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { createCustomer, uploadCustomerImages } from "../services/authService";

const InvoicePreview = () => {
  const navigate = useNavigate();
  const data = JSON.parse(sessionStorage.getItem("invoicePreviewData"));

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState(false);

  if (!data) return <Typography>No data found.</Typography>;

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-content");
    html2pdf()
      .set({
        margin: 10,
        filename: "invoice.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  const handlePrint = () => window.print();

  const handleEdit = () => {
    sessionStorage.setItem("isEditMode", "true");
    navigate("/customer-form");
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);

      const { newImages, ...customerPayload } = data;

      // Create Customer
      const res = await createCustomer(customerPayload);
      const customerId = res.data.customerId;

      // Upload Images if present
      if (newImages && newImages.length > 0) {
        const form = new FormData();
        form.append("CustomerId", customerId);

        await Promise.all(
          newImages.map(async (imgBase64, index) => {
            const blob = await fetch(imgBase64).then((res) => res.blob());
            form.append("Images", blob, `image-${index}.jpg`);
          })
        );

        await uploadCustomerImages(form);
      }

      // ✅ Snackbar success
      setSnackbar({
        open: true,
        message: "Customer and images submitted successfully!",
        severity: "success",
      });

      sessionStorage.removeItem("invoicePreviewData");
      navigate("/success");
    } catch (error) {
      console.error("Error submitting:", error);
      setSnackbar({
        open: true,
        message: "Submission failed. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          "@media print": {
            boxShadow: "none",
            border: "none",
            mt: 0,
            p: 0,
          },
        }}
      >
        {/* Invoice Content */}
        <Box id="invoice-content" sx={{ mb: 3 }}>
          {/* Company Header */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              GURUDATTA DISTRIBUTOR’S
            </Typography>
            <Typography variant="subtitle1" fontStyle="italic" gutterBottom>
              Authorised Dealer In Inner Wear
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact: +91 99211 41312
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Invoice Header */}
          <Grid container justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">
                🧾 Invoice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated on:{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="500">
              Invoice No: <strong>{Date.now()}</strong>
            </Typography>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Customer + Shop Info */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Customer Details
              </Typography>
              <Typography>Name: {data.customerName}</Typography>
              <Typography>Phone: {data.customerPhone}</Typography>
              <Typography>Email: {data.customerEmail || "N/A"}</Typography>
              <Typography>Address: {data.customerAddress}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Shop Details
              </Typography>
              <Typography>Shop: {data.shopName}</Typography>
              <Typography>Salesman PIN: {data.salesmanPin}</Typography>
              <Typography>Status: {data.customerOrderStatus}</Typography>
              <Typography>
                Verification: {data.customerVerificationStatus}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Order Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Order Information
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, backgroundColor: "#fafafa" }}
            >
              <Typography>
                {data.customerOrderDetails || "No specific order details"}
              </Typography>
            </Paper>
          </Box>

          {/* Uploaded Images */}
          {data.newImages?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Uploaded Images
              </Typography>
              <Grid container spacing={2}>
                {data.newImages.map((base64, idx) => (
                  <Grid item key={idx} xs={6} sm={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        overflow: "hidden",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={base64}
                        alt={`preview-${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Thank you for your business!
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons (Hidden in Print) */}
        <Grid
          container
          spacing={2}
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleEdit}
              sx={{ textTransform: "none" }}
            >
              Edit
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleFinalSubmit}
              disabled={loading}
              sx={{ textTransform: "none" }}
              startIcon={loading && <CircularProgress size={18} />}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handlePrint}
              sx={{ textTransform: "none" }}
            >
              Print
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleDownloadPDF}
              sx={{ textTransform: "none" }}
            >
              Download PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InvoicePreview;
