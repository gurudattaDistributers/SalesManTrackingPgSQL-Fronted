import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Box,
  Grid,
} from "@mui/material";

import {
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Send as SendIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import {
  getCustomerByPhone,
  logout,
  otpsende,
  otpverify,
} from "../services/authService";

const CustomerForm = () => {
  const navigate = useNavigate();
  const salesmanPin = localStorage.getItem("salesmanPin");

  const [formData, setFormData] = useState({
    customerName: "",
    shopName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerOrderStatus: "Pending",
    customerVerificationStatus: "Unverified",
    customerOrderDetails: "",
    salesmanPin: salesmanPin || "",
  });

  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [isEditMode, setIsEditMode] = useState(false);

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    const sessionData = sessionStorage.getItem("invoicePreviewData");
    const editMode = sessionStorage.getItem("isEditMode") === "true";
    setIsEditMode(editMode);

    if (sessionData) {
      const parsed = JSON.parse(sessionData);

      setFormData((prev) => ({
        ...prev,
        ...parsed,
        customerVerificationStatus:
          parsed.customerVerificationStatus || "Unverified",
      }));

      if (parsed.customerVerificationStatus === "Verified") {
        setOtpSent(true);
      }

      if (parsed.newImages) {
        const reconstructed = parsed.newImages.map((base64) => {
          const byteString = atob(base64.split(",")[1]);
          const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          return new File([blob], "image.jpg", { type: mimeString });
        });
        setImages(reconstructed);
      }
    }
  }, [salesmanPin]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.customerPhone) {
      newErrors.customerPhone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = "Enter a valid 10-digit phone number";
    }
    if (!formData.customerName) newErrors.customerName = "Customer Name is required";
    if (!formData.shopName) newErrors.shopName = "Shop Name is required";
    if (!formData.customerAddress) newErrors.customerAddress = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (
        name === "customerPhone" &&
        value !== prev.customerPhone &&
        prev.customerVerificationStatus !== "Verified"
      ) {
        return {
          ...prev,
          [name]: value,
          customerVerificationStatus: "Unverified",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleFileChange = (e) => setImages(Array.from(e.target.files));

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      const res = await otpsende(formData.customerPhone);
      if (res.Status === "Success") {
        localStorage.setItem("otpSessionId", res.Details);
        setOtpSent(true);
        showToast("OTP sent successfully", "success");
      } else {
        showToast("Failed to send OTP", "error");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      showToast("OTP send failed", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setVerifying(true);
      const sessionId = localStorage.getItem("otpSessionId");
      const res = await otpverify(sessionId, otp);
      if (res?.Details === "OTP Matched") {
        showToast("OTP verification successful", "success");
        setFormData((prev) => ({
          ...prev,
          customerVerificationStatus: "Verified",
        }));
      } else {
        showToast("OTP verification failed", "error");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      showToast("OTP verification failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handlePhoneBlur = async () => {
    if (!formData.customerPhone) return;
    if (isEditMode && formData.customerVerificationStatus === "Verified") return;

    try {
      const res = await getCustomerByPhone(formData.customerPhone);
      if (res.data) {
        const customer = res.data;
        setFormData((prev) => ({
          ...prev,
          customerName: customer.customerName || "",
          shopName: customer.shopName || "",
          customerEmail: customer.customerEmail || "",
          customerPhone: prev.customerPhone,
          customerAddress: customer.customerAddress || "",
          customerOrderStatus: "Pending",
          customerVerificationStatus: prev.customerVerificationStatus,
          customerOrderDetails: "",
          salesmanPin,
        }));
      }
    } catch (err) {
      console.error("Error fetching customer:", err);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const convertToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

      const base64Images = await Promise.all(
        images.map((img) => convertToBase64(img))
      );

      sessionStorage.setItem(
        "invoicePreviewData",
        JSON.stringify({ ...formData, newImages: base64Images })
      );

      navigate("/invoice-preview");
    } catch (err) {
      console.error("Error preparing preview:", err);
      showToast("Something went wrong", "error");
    }
  };

  const isVerified = formData.customerVerificationStatus === "Verified";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
        py: 5,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 4, overflow: "hidden" }}>
          {/* 🌟 Header */}
          <CardHeader
            title={
              <Typography variant="h5" fontWeight="bold" color="white">
                Customer Registration
              </Typography>
            }
            action={
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  logout();                 // 🔹 clear auth context + storage
                  navigate("/", { replace: true }); // 🔹 prevent going back to protected page
                }}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.4)" },
                }}
              >
                Logout
              </Button>
            }

            sx={{
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
              p: 2,
            }}
          />

          <CardContent>
            {/* 📞 Phone Verification Section */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Phone Verification
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              label="Phone Number"
              name="customerPhone"
              fullWidth
              required
              margin="normal"
              value={formData.customerPhone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              error={!!errors.customerPhone}
              helperText={errors.customerPhone}
              InputProps={{
                readOnly: isEditMode && isVerified,
                endAdornment: isVerified && (
                  <InputAdornment position="end">
                    <CheckCircleIcon color="success" />
                  </InputAdornment>
                ),
              }}
            />

            {formData.customerPhone && (
              <Box mt={1} display="flex" gap={2}>
                {!otpSent ? (
                  <Button
                    variant="outlined"
                    onClick={handleSendOtp}
                    startIcon={<SendIcon />}
                    fullWidth
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? "Sending OTP..." : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <TextField
                      label="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      fullWidth
                      disabled={isVerified}
                      margin="normal"
                    />
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleVerifyOtp}
                      disabled={verifying || isVerified}
                      endIcon={
                        verifying ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <VerifiedIcon />
                        )
                      }
                    >
                      {isVerified ? "Verified" : "Verify"}
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* 📝 Customer Info Section */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ mt: 3 }}
            >
              Customer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              label="Customer Name"
              name="customerName"
              fullWidth
              required
              margin="normal"
              value={formData.customerName}
              onChange={handleChange}
              error={!!errors.customerName}
              helperText={errors.customerName}
            />

            <TextField
              label="Shop Name"
              name="shopName"
              fullWidth
              required
              margin="normal"
              value={formData.shopName}
              onChange={handleChange}
              error={!!errors.shopName}
              helperText={errors.shopName}
            />

            <TextField
              label="Email"
              name="customerEmail"
              fullWidth
              margin="normal"
              value={formData.customerEmail}
              onChange={handleChange}
            />

            <TextField
              label="Salesman PIN"
              fullWidth
              margin="normal"
              value={formData.salesmanPin}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Address"
              name="customerAddress"
              fullWidth
              required
              margin="normal"
              value={formData.customerAddress}
              onChange={handleChange}
              error={!!errors.customerAddress}
              helperText={errors.customerAddress}
            />

            <TextField
              label="Order Details"
              name="customerOrderDetails"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.customerOrderDetails}
              onChange={handleChange}
            />

            {/* 📸 Image Upload Section */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ mt: 3 }}
            >
              Upload Images
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            <Grid container spacing={2}>
              {images.map((img, index) => (
                <Grid item key={index}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`img-${index}`}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                    />
                    <IconButton
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "white",
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* ✅ Submit */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 4,
                borderRadius: 3,
                py: 1.5,
                fontWeight: "bold",
              }}
              onClick={handleSubmit}
            >
              Done & Preview
            </Button>
          </CardContent>
        </Card>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            variant="filled"
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CustomerForm;
