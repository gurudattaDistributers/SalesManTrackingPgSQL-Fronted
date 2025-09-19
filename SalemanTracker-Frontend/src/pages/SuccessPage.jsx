// SuccessPage.jsx
import React from "react";
import { Button, Typography, Container, Stack, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { logout } from "../services/authService";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const handleRegisterAnother = () => {
    navigate("/customer-form");
  };

  const handleGoHome = () => {
    logout();
    navigate("/",{ replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        position: "relative",
        overflow: "hidden",
        p: 2,
      }}
    >
      {/* 🎉 Confetti Celebration */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={250}
      />

      {/* ✨ Floating background circles */}
      <motion.div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255, 182, 193, 0.4)",
        }}
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(173, 216, 230, 0.35)",
        }}
        animate={{ y: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />

      {/* 🎊 Center content card */}
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 4,
          p: 5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        {/* ✅ Glowing Animated Check Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1.2, 1, 1.1, 1] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ position: "relative", display: "inline-block" }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(76,175,80,0.3) 0%, transparent 70%)",
              zIndex: -1,
            }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <CheckCircleIcon color="success" sx={{ fontSize: 100 }} />
        </motion.div>

        {/* 📝 Success Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <Typography variant="h4" mt={3} gutterBottom>
            Submission Successful!
          </Typography>
          <Typography variant="body1" mb={4} color="text.secondary">
            The customer has been successfully registered.
          </Typography>
        </motion.div>

        {/* 🎯 Buttons with Hover Animation */}
        <Stack spacing={2} direction="row" justifyContent="center">
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(45deg, #FF6F61, #FF8E53)",
                borderRadius: "25px",
                px: 3,
                py: 1,
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              }}
              onClick={handleRegisterAnother}
            >
              Register Another
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              sx={{
                borderRadius: "25px",
                px: 3,
                py: 1,
                borderWidth: 2,
              }}
              color="secondary"
              onClick={handleGoHome}
            >
              Go to Home
            </Button>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
};

export default SuccessPage;
