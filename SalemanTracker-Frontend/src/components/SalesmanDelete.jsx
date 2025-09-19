import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  deleteSalesman,
  deleteMultipleSalesmanImages,
  getSalesmanByPin,
} from "../services/authService";

const SalesmanDelete = () => {
  const { salesmanPin } = useParams();
  const navigate = useNavigate();

  const [salesman, setSalesman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch salesman details
  useEffect(() => {
    const fetchSalesman = async () => {
      try {
        const res = await getSalesmanByPin(salesmanPin);
        setSalesman(res);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch salesman details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesman();
  }, [salesmanPin]);

  const handleDelete = async () => {
    if (!salesman) return;

    // Optimistic update: show success instantly
    setSuccess(`Deleted ${salesman.name} successfully.`);
    setDeleting(true);

    // Navigate away immediately (feels instant)
    navigate("/salesman-info");

    try {
      // Run deletions in parallel in background
      const deleteTasks = [];

      if (salesman.imageIds && salesman.imageIds.length > 0) {
        deleteTasks.push(deleteMultipleSalesmanImages(salesman.imageIds));
      }
      deleteTasks.push(deleteSalesman(salesmanPin));

      await Promise.all(deleteTasks);
    } catch (err) {
      console.error("Background deletion failed:", err);
      // Optional: show a toast/notification here instead of rollback,
      // since user has already left the page
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={4} textAlign="center">
        <Typography variant="h5" gutterBottom>
          Delete Salesman
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        {salesman && (
          <>
            <Typography mt={3}>
              Are you sure you want to delete{" "}
              <strong>{salesman.name}</strong> (Pin: {salesmanPin})?
            </Typography>

            <Box mt={4}>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </Button>

              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={() => navigate(-1)}
                disabled={deleting}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default SalesmanDelete;
