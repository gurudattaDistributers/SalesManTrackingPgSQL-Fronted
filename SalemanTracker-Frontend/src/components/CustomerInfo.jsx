import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  CardMedia,
  Divider,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Pagination,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, Edit, ArrowBack } from "@mui/icons-material";
import {
  getAllCustomers,
  getCustomerImages,
  deleteAllCustomerimages,
  deleteCustomer,
} from "../services/authService";

const CustomerInfo = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    customerId: null,
  });

  const itemsPerPage = 6;
  const navigate = useNavigate();

  // For drag pan
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getAllCustomers();
        setCustomers(res.data);
        setFilteredCustomers(res.data);

        const imageFetches = await Promise.all(
          res.data.map(async (customer) => {
            const imageRes = await getCustomerImages(customer.customerId);
            return { customerId: customer.customerId, images: imageRes.data };
          })
        );

        const imagesByCustomer = {};
        imageFetches.forEach(({ customerId, images }) => {
          imagesByCustomer[customerId] = images;
        });

        setImagesMap(imagesByCustomer);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setSnackbar({
          open: true,
          message: "Failed to load customers.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // 🔹 Global search
  useEffect(() => {
    const results = customers.filter((customer) => {
      const values = [
        customer.customerName,
        customer.shopName,
        customer.customerEmail,
        customer.customerPhone,
        customer.customerAddress,
        customer.customerOrderDetails,
        customer.customerOrderStatus,
        customer.customerVerificationStatus,
      ]
        .filter(Boolean)
        .map((v) => v.toString().toLowerCase());

      return values.some((val) => val.includes(searchTerm.toLowerCase()));
    });
    setFilteredCustomers(results);
    setPage(1);
  }, [searchTerm, customers]);

  const handleDeleteRequest = (customerId) => {
    setConfirmDialog({ open: true, customerId });
  };

  const handleDeleteConfirm = async () => {
    const { customerId } = confirmDialog;
    setConfirmDialog({ open: false, customerId: null });

    try {
      const images = await getCustomerImages(customerId);
      if (images && images.length > 0) {
        await deleteAllCustomerimages(customerId);
      }

      await deleteCustomer(customerId);

      setCustomers((prev) => prev.filter((c) => c.customerId !== customerId));
      setFilteredCustomers((prev) =>
        prev.filter((c) => c.customerId !== customerId)
      );

      setSnackbar({
        open: true,
        message: "Customer and related images deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete customer.",
        severity: "error",
      });
    }
  };

  const handleEdit = (id) => {
    navigate(`/update-customer/${id}`);
  };

  const handleImageClick = (url, customerId, index) => {
    setSelectedImage({
      url,
      customerId,
      index,
      scale: 1,
      pinchStartDistance: null,
    });
  };

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading customers...
        </Typography>
      </Container>
    );
  }

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.pageX - containerRef.current.offsetLeft,
      y: e.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
    containerRef.current.style.cursor = "grabbing";
    e.preventDefault();
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = x - dragStart.current.x;
    const walkY = y - dragStart.current.y;
    containerRef.current.scrollLeft = dragStart.current.scrollLeft - walkX;
    containerRef.current.scrollTop = dragStart.current.scrollTop - walkY;
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/admin-dashboard")}
        >
          Back
        </Button>
      </Box>

      {/* Heading */}
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", mb: 3, color: "#FF8C42" }}
      >
        CUSTOMER INFORMATION
      </Typography>

      {/* Search */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <TextField
          label="Search Customers"
          placeholder="Search by name, phone, email, address, shop, etc."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "60%" }}
        />
      </Box>

      {/* Cards */}
      <Grid container spacing={3} justifyContent="center">
        {paginatedCustomers.map((customer, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={customer.customerId || `customer-${index}`}
          >
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                width: "100%",
                height: 480,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" gutterBottom noWrap>
                  {customer.customerName}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  Shop: {customer.shopName}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {customer.customerEmail || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {customer.customerPhone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {customer.customerAddress}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Order Details:</strong>{" "}
                    {customer.customerOrderDetails || "N/A"}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  {/* 🔹 Order Status Chip with Colors */}
                  <Chip
                    label={`Order: ${customer.customerOrderStatus}`}
                    sx={{
                      mr: 1,
                      mb: 1,
                      color: "#fff",
                      backgroundColor:
                        customer.customerOrderStatus === "Completed"
                          ? "green"
                          : customer.customerOrderStatus === "Pending"
                          ? "red"
                          : customer.customerOrderStatus === "Cancelled"
                          ? "gray"
                          : "blue",
                    }}
                  />
                  <Chip
                    label={`Verification: ${customer.customerVerificationStatus}`}
                    color={
                      customer.customerVerificationStatus === "Verified"
                        ? "success"
                        : "warning"
                    }
                    sx={{ mb: 1 }}
                  />

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded Images:
                  </Typography>
                  <Grid container spacing={1}>
                    {imagesMap[customer.customerId]?.length > 0 ? (
                      imagesMap[customer.customerId].map((img, idx) => (
                        <Grid
                          item
                          xs={4}
                          key={
                            img.customerImageId ||
                            `${customer.customerId}-${idx}`
                          }
                        >
                          <CardMedia
                            component="img"
                            image={img.imageUrl}
                            alt={`Customer Image ${idx + 1}`}
                            onClick={() =>
                              handleImageClick(
                                img.imageUrl,
                                customer.customerId,
                                idx
                              )
                            }
                            sx={{
                              borderRadius: 2,
                              height: 70,
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ pl: 1 }}
                        >
                          No images uploaded.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </CardContent>

              {/* Actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  p: 1,
                  borderTop: "1px solid #eee",
                }}
              >
                <IconButton
                  color="primary"
                  onClick={() => handleEdit(customer.customerId)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteRequest(customer.customerId)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Pagination
          count={Math.ceil(filteredCustomers.length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Grid>

      {/* Image Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        fullScreen
        PaperProps={{
          style: { backgroundColor: "#000" },
        }}
      >
        <DialogContent
          sx={{
            width: "100%",
            height: "100%",
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: "#000",
            touchAction: "none",
          }}
        >
          {selectedImage && (
            <div
              ref={containerRef}
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                cursor: "grab",
              }}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.15 : 0.15;
                setSelectedImage((prev) => {
                  const newScale = Math.min(
                    Math.max((prev.scale || 1) + delta, 0.5),
                    6
                  );
                  return { ...prev, scale: newScale };
                });
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
            >
              <img
                src={selectedImage.url}
                alt="Zoomable"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `scale(${selectedImage.scale || 1})`,
                  transformOrigin: "center",
                  transition: isDragging.current
                    ? "none"
                    : "transform 0.05s ease-out",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ backgroundColor: "#000" }}>
          <Button sx={{ color: "#fff" }} onClick={() => setSelectedImage(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, customerId: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this customer and all related images?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, customerId: null })}
          >
            Cancel
          </Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerInfo;
