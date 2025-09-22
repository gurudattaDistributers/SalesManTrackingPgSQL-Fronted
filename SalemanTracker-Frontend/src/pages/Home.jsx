import React from "react";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";



const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      {/* Top Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          color: "#000",
          borderBottom: "1px solid #eee",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            py: { xs: 1, sm: 0 },
            gap: { xs: 1, sm: 0 },
          }}
        >
          {/* Logo + Company Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src={"https://res.cloudinary.com/dsrrvz65s/image/upload/v1758534431/logo_bcwjge.png"}
              alt="Logo"
              sx={{
                width: { xs: 35, sm: 45 },
                height: { xs: 35, sm: 45 },
              }}
            />
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.1rem", sm: "1.4rem" },
                color: "#000000ff",
              }}
            >
              GURUDATTA DISTRIBUTORS
            </Typography>
          </Box>

          {/* Contact Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 0.5, sm: 2 },
              mt: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                color: "#333",
              }}
            >
              📞 9921141312
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontWeight: "bold",
                color: "#555",
              }}
            >
              📍 Pune
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundImage: `url("https://res.cloudinary.com/dsrrvz65s/image/upload/v1758534432/home_wdp2p4.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 4 },
          py: { xs: 5, sm: 0 },
          position: "relative",
        }}
      >
        {/* Dark overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.3)",
          }}
        />

        {/* Hero Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mr: { xs: 0, md: -80 },
            mt: { xs: 0, md: 7 },
            textAlign: "center",
            maxWidth: { xs: "90%", sm: "500px" },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 3,
              lineHeight: 1.4,
              color: "white",
              fontSize: { xs: "1.8rem", sm: "3rem" },
            }}
          >
            Track Every Visit <br /> No Excuses
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ff7b1b",
              borderRadius: "25px",
              px: { xs: 4, sm: 6 },
              py: { xs: 1.5, sm: 2 },
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "#e46d16",
              },
            }}
            onClick={() => navigate("/login")}
          >
            Start Tracking
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
