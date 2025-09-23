import React, { useEffect, useState, useCallback } from "react";
import {
  getAllSalesman,
  getSalesmanImage,
  deleteSalesman,
  deleteMultipleSalesmanImages,
} from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Typography,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  Download,
  ArrowBackIos,
  ArrowForwardIos,
  RestartAlt,
  Search,
} from "@mui/icons-material";

const SalesmanInfo = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalesmanIndex, setSelectedSalesmanIndex] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // Fetch Salesmen + Images
  useEffect(() => {
    const fetchSalesmen = async () => {
      try {
        const res = await getAllSalesman();
        const data = res.data || res;

        const salesmenWithImages = await Promise.all(
          data.map(async (s) => {
            try {
              const imgs = await getSalesmanImage(s.salesmanPin);
              return { ...s, images: imgs || [] };
            } catch {
              return { ...s, images: [] };
            }
          })
        );
        setSalesmen(salesmenWithImages);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load salesmen.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSalesmen();
  }, []);

  // Delete Salesman
  const handleDeleteSalesman = async (salesman) => {
    try {
      const ids = salesman.images?.map((i) => i.salesmanImageId) || [];
      if (ids.length) await deleteMultipleSalesmanImages(ids);
      await deleteSalesman(salesman.salesmanPin);

      setSalesmen((prev) =>
        prev.filter((s) => s.salesmanPin !== salesman.salesmanPin)
      );
      setSnackbar({
        open: true,
        message: "Salesman deleted successfully.",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete salesman.",
        severity: "error",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Image Viewer Controls
  const openImage = (sIndex, iIndex) => {
    setSelectedSalesmanIndex(sIndex);
    setSelectedImageIndex(iIndex);
    resetView();
  };
  const closeImage = () => {
    setSelectedSalesmanIndex(null);
    setSelectedImageIndex(null);
  };
  const resetView = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 4));
  };
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const handleMouseMove = (e) => {
    if (dragging) {
      setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setDragging(false);

  const nextImage = () => {
    const imgs = salesmen[selectedSalesmanIndex].images;
    setSelectedImageIndex((prev) => (prev + 1) % imgs.length);
    resetView();
  };
  const prevImage = () => {
    const imgs = salesmen[selectedSalesmanIndex].images;
    setSelectedImageIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : imgs.length - 1
    );
    resetView();
  };

  // Keyboard Navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (selectedSalesmanIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeImage();
    },
    [selectedSalesmanIndex]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Filtered Salesmen
  const filteredSalesmen = salesmen.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.salesmanName?.toLowerCase().includes(q) ||
      s.salesmanPin?.toString().toLowerCase().includes(q) ||
      s.salesmanEmail?.toLowerCase().includes(q) ||
      s.salesmanPhone?.toLowerCase().includes(q)
    );
  });

  // Loader
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: "orange" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FF8C42, #FF5F6D)",
          borderRadius: 3,
          p: 4,
          mb: 3,
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            🧑‍💼 Salesmen Directory
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1, opacity: 0.9 }}>
            Manage your sales team profiles at a glance
          </Typography>
        </Box>

        <Box display="flex" gap={2} mt={{ xs: 2, md: 0 }}>
          <Button
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "#ffd1c4",
                background: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={() => navigate("/admin-dashboard")}
          >
            ← Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              bgcolor: "white",
              color: "#FF5F6D",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#ffe8e5" },
            }}
            onClick={() => navigate("/create-salesman")}
          >
            New Salesman
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box mb={4} display="flex" justifyContent="flex-end">
        <TextField
          variant="outlined"
          placeholder="Search by name, pin, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 350 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Salesmen Cards */}
      <Grid container spacing={2} alignItems="stretch">
        {filteredSalesmen.length === 0 ? (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              No salesmen found
            </Typography>
          </Grid>
        ) : (
          filteredSalesmen.map((s, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={s.salesmanPin}>
              <Card
                sx={{
                  borderRadius: 3,
                  width: "100",
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "background.paper",
                  color: "text.primary",
                  position: "relative",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {/* Actions */}
                <Box
                  position="absolute"
                  bottom={8}
                  right={8}
                  display="flex"
                  gap={1}
                >
                  <IconButton
                    size="small"
                    sx={{ bgcolor: "#f1f1f1" }}
                    onClick={() => navigate(`/edit-salesman/${s.salesmanPin}`)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ bgcolor: "#f1f1f1", color: "red" }}
                    onClick={() => setConfirmDelete(s)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                {/* Image */}
                {s.images?.length > 0 ? (
                  <CardMedia
                    component="img"
                    image={s.images[0].imageUrl}
                    sx={{
                      height: 180,
                      width: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => openImage(idx, 0)}
                  />
                ) : (
                  <Box
                    height={180}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="grey.200"
                  >
                    <Typography variant="body2" color="text.secondary">
                      No Image
                    </Typography>
                  </Box>
                )}

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, overflow: "hidden" }}>
                  <Typography variant="h6" noWrap>
                    {s.salesmanName}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Pin: {s.salesmanPin}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {s.salesmanEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {s.salesmanPhone}
                  </Typography>
                  {s.images?.length > 1 && (
                    <Typography variant="caption" color="primary">
                      {s.images.length} images available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Delete Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{confirmDelete?.salesmanName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDeleteSalesman(confirmDelete)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      {selectedSalesmanIndex !== null && (
        <Box
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          {/* Controls */}
          <Box position="absolute" top={20} right={20} display="flex" gap={2}>
            <IconButton onClick={resetView} sx={{ color: "white" }}>
              <RestartAlt />
            </IconButton>
            <IconButton onClick={closeImage} sx={{ color: "white" }}>
              <Close />
            </IconButton>
            <IconButton
              onClick={async () => {
                const url =
                  salesmen[selectedSalesmanIndex].images[selectedImageIndex]
                    .imageUrl;
                const res = await fetch(url);
                const blob = await res.blob();
                const dlUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = dlUrl;
                link.download = url.split("/").pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(dlUrl);
              }}
              sx={{ color: "white" }}
            >
              <Download />
            </IconButton>
          </Box>

          {/* Navigation */}
          <IconButton
            onClick={prevImage}
            sx={{ position: "absolute", left: 20, color: "white" }}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            onClick={nextImage}
            sx={{ position: "absolute", right: 20, color: "white" }}
          >
            <ArrowForwardIos />
          </IconButton>

          {/* Image */}
          <img
            src={
              salesmen[selectedSalesmanIndex].images[selectedImageIndex].imageUrl
            }
            alt="Full"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 0.2s ease-out",
              borderRadius: "10px",
              maxWidth: "90%",
              maxHeight: "85%",
              cursor: zoom > 1 ? "grab" : "default",
              boxShadow: "0 0 25px rgba(0,0,0,0.5)",
            }}
          />
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default SalesmanInfo;
