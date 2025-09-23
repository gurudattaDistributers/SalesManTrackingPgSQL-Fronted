import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  AssignmentTurnedIn,
  PendingActions,
  Groups,
  EmojiEvents,
} from "@mui/icons-material";
import {
  getAllCustomers,
  getAllSalesman,
  logout,
} from "../services/authService";

// --- Config ---
const OVERDUE_DAYS = 7;
const COLORS = {
  pending: "#ff9800",
  completed: "#4caf50",
  overdue: "#ef5350",
  weekly: "#2196f3",
  cancelled: "#9e9e9e",
  rejected: "#b71c1c",
};

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

// ---- Reusable Section Wrapper ----
const Section = ({ title, subtitle, toolbar, children, sx }) => (
  <Paper
    elevation={3}
    sx={{ p: 3, borderRadius: 3, mb: 3, bgcolor: "#fff", ...sx }}
  >
    {(title || toolbar) && (
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        flexDirection={{ xs: "column", md: "row" }}
        gap={1}
        mb={2}
      >
        <Box>
          {title && (
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {toolbar && <Box>{toolbar}</Box>}
      </Box>
    )}
    {children}
  </Paper>
);

// ---- Custom Tooltips ----
const SalesmanTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { salesman, orders, percentage } = payload[0].payload;
    return (
      <Paper
        sx={{
          p: 1.2,
          bgcolor: "#fff",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          {salesman}
        </Typography>
        <Typography variant="body2">Orders: {orders}</Typography>
        <Typography variant="body2">Share: {percentage}%</Typography>
      </Paper>
    );
  }
  return null;
};

const DonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0];
    return (
      <Paper sx={{ p: 1.2, boxShadow: "0 3px 10px rgba(0,0,0,0.15)" }}>
        <Typography variant="body2" fontWeight={700}>
          {p.name}
        </Typography>
        <Typography variant="body2">Count: {p.value}</Typography>
      </Paper>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [salesmenMap, setSalesmenMap] = useState({});

  // Filters
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [salesmanFilter, setSalesmanFilter] = useState("all");

  const goToSalesman = () => navigate("/salesman-info");
  const goToCustomer = () => navigate("/customer-info");

  useEffect(() => {
    const fetchData = async () => {
      setErr(null);
      setLoading(true);
      try {
        const [resCustomers, resSalesmen] = await Promise.all([
          getAllCustomers(),
          getAllSalesman(),
        ]);

        const cs = resCustomers?.data || [];
        const sm = resSalesmen?.data || [];

        const map = {};
        sm.forEach((s) => {
          map[s.salesmanPin] = s.salesmanName;
        });

        setCustomers(cs);
        setSalesmen(sm);
        setSalesmenMap(map);
      } catch (e) {
        console.error(e);
        setErr("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----- Filtering -----
  const filteredCustomers = useMemo(() => {
    let list = [...customers];
    const now = new Date();

    if (dateRange === "today") {
      list = list.filter((c) => {
        const d = new Date(c.createdAt);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      });
    } else if (dateRange === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      list = list.filter((c) => new Date(c.createdAt) >= oneWeekAgo);
    } else if (dateRange === "month") {
      list = list.filter((c) => {
        const d = new Date(c.createdAt);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      });
    } else if (dateRange === "custom" && customFrom && customTo) {
      const from = new Date(customFrom);
      const to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= from && d <= to;
      });
    }

    if (salesmanFilter !== "all") {
      list = list.filter(
        (c) => String(c.salesmanPin) === String(salesmanFilter)
      );
    }

    return list;
  }, [customers, dateRange, customFrom, customTo, salesmanFilter]);

  // ----- Metrics -----
  const summary = useMemo(() => {
    const total = filteredCustomers.length;
    const pending = filteredCustomers.filter(
      (c) => c.customerOrderStatus === "Pending"
    ).length;
    const completed = filteredCustomers.filter(
      (c) => c.customerOrderStatus === "Completed"
    ).length;
    const cancelled = filteredCustomers.filter(
      (c) => c.customerOrderStatus === "Cancelled"
    ).length;
    return { total, pending, completed, cancelled };
  }, [filteredCustomers]);

  const overduePending = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - OVERDUE_DAYS);
    return filteredCustomers.filter(
      (c) =>
        c.customerOrderStatus === "Pending" && new Date(c.createdAt) < cutoff
    ).length;
  }, [filteredCustomers]);

  const newThisWeek = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    return customers.filter((c) => new Date(c.createdAt) >= oneWeekAgo).length;
  }, [customers]);

  const newThisMonth = useMemo(() => {
    const now = new Date();
    return customers.filter((c) => {
      const d = new Date(c.createdAt);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    }).length;
  }, [customers]);

  const weeklyData = useMemo(() => {
    const map = {};
    filteredCustomers.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([day, orders]) => ({ day, orders }));
  }, [filteredCustomers]);

  const salesmanData = useMemo(() => {
    const map = {};
    filteredCustomers.forEach((c) => {
      const pin = c.salesmanPin || "Unassigned";
      const name = salesmenMap[pin] || "Unknown";
      const key = `${name}`;
      map[key] = (map[key] || 0) + 1;
    });
    const totalOrders = filteredCustomers.length || 1;
    return Object.entries(map).map(([salesman, orders]) => ({
      salesman,
      orders,
      percentage: ((orders / totalOrders) * 100).toFixed(1),
    }));
  }, [filteredCustomers, salesmenMap]);

  const topSalesmen = useMemo(() => {
    const map = {};
    filteredCustomers.forEach((c) => {
      if (c.customerOrderStatus !== "Completed") return;
      const pin = c.salesmanPin || "Unassigned";
      const name = salesmenMap[pin] || "Unknown";
      const key = `${name} (${pin})`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([salesman, orders]) => ({ salesman, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3);
  }, [filteredCustomers, salesmenMap]);

  const statusTimeline = useMemo(() => {
    const monthMap = {};
    filteredCustomers.forEach((c) => {
      const month = new Date(c.createdAt).toLocaleString("default", {
        month: "short",
      });
      if (!monthMap[month])
        monthMap[month] = { Pending: 0, Completed: 0, Cancelled: 0 };
      const st = c.customerOrderStatus;
      if (st && monthMap[month][st] !== undefined) {
        monthMap[month][st] += 1;
      } else if (st) {
        monthMap[month][st] = (monthMap[month][st] || 0) + 1;
      }
    });
    return Object.entries(monthMap).map(([month, v]) => ({
      month,
      Pending: v.Pending || 0,
      Completed: v.Completed || 0,
      Cancelled: v.Cancelled || 0,
    }));
  }, [filteredCustomers]);

  const donutData = useMemo(() => {
    return [
      { name: "Completed", value: summary.completed, color: COLORS.completed },
      { name: "Pending", value: summary.pending, color: COLORS.pending },
    ];
  }, [summary]);

  // ---- Loading ----
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 6 }}>
        <Grid container spacing={3}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={360} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={360} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={380} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {/* ---- Header ---- */}
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          position: "relative",
        }}
      >
       <Box
  sx={{
    position: "absolute",
    top: { xs: "8px", md: 0 },
    right: { xs: "8px", md: 0 },
  }}
      >
        <Button
          size="small"
          variant="outlined"
          color="error"
          sx={{
            fontSize: { xs: "0.75rem", md: "0.875rem" },
            padding: { xs: "4px 10px", md: "6px 16px" },
          }}
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </Button>
      </Box>


        <Typography
          variant="h3"
          fontWeight={1000}
          gutterBottom
          sx={{ color: "#d07e03ff" }}
        >
          GURUDATTA DISTRIBUTER'S
        </Typography>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          📊 Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor orders, track performance, and view trends
        </Typography>
      </Box>

      {/* ---- Filter Bar ---- */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          borderRadius: 3,
          mb: 4,
          background: "linear-gradient(135deg, #ea9e06ff)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} lg={2.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {dateRange === "custom" && (
            <>
              <Grid item xs={12} sm={6} md={3} lg={2.5}>
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={2.5}>
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6} md={3} lg={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Salesman</InputLabel>
              <Select
                label="Salesman"
                value={salesmanFilter}
                onChange={(e) => setSalesmanFilter(e.target.value)}
              >
                <MenuItem value="all">All Salesmen</MenuItem>
                {salesmen.map((s) => (
                  <MenuItem key={s.salesmanPin} value={String(s.salesmanPin)}>
                    {s.salesmanName} ({s.salesmanPin})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md="auto" sx={{ ml: { md: "auto" } }}>
            <Box
              display="flex"
              gap={1}
              justifyContent={{ xs: "stretch", md: "flex-end" }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={goToSalesman}
              >
                Salesman Info
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={goToCustomer}
              >
                Customer Info
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ---- Summary Cards ---- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          flexWrap: "wrap",
          mb: 3,
          maxWidth: "900px", // prevents them from stretching too far
          mx: "auto", // centers the row
        }}
      >
        {[
          {
            title: "Total Orders",
            value: summary.total,
            color: "#2196f3",
            icon: <AssignmentTurnedIn />,
          },
          {
            title: "Pending Orders",
            value: summary.pending,
            color: COLORS.pending,
            icon: <PendingActions />,
          },
          {
            title: "Completed Orders",
            value: summary.completed,
            color: COLORS.completed,
            icon: <Groups />,
          },
        ].map((card, i) => (
          <Card
            key={i}
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              width: 250, // fixed card width for neat look
              flexGrow: 1,
              textAlign: "center",
            }}
          >
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ fontSize: 40, color: card.color, mb: 1 }}>
                {card.icon}
              </Box>
              <Typography variant="subtitle2" color="text.secondary">
                {card.title}
              </Typography>
              <Typography
                variant="h3"
                sx={{ color: card.color, fontWeight: 800 }}
              >
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* ---- Quick Insights Chips ---- */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 3,
          justifyContent: "center", // center chips
        }}
      >
        <Chip label={`New this week: ${newThisWeek}`} color="primary" />
        <Chip label={`New this month: ${newThisMonth}`} color="success" />
        <Chip
          label={`Overdue pending (${OVERDUE_DAYS}d+): ${overduePending}`}
          sx={{ bgcolor: COLORS.overdue, color: "#fff" }}
        />
        {summary.cancelled > 0 && (
          <Chip
            label={`Cancelled: ${summary.cancelled}`}
            sx={{ bgcolor: COLORS.cancelled, color: "#fff" }}
          />
        )}
      </Box>

      {/* ---- Progress + Donut ---- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          flexWrap: "wrap",
          mb: 4,
          maxWidth: "950px", // keeps layout compact
          mx: "auto", // centers the row
        }}
      >
        {/* Progress Card */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            flex: "1 1 350px",
            maxWidth: 420,
            minWidth: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            ⏳ Order Completion Progress
          </Typography>

          <Box sx={{ position: "relative", display: "inline-flex", mt: 2 }}>
            <CircularProgress
              variant="determinate"
              value={(summary.completed / (summary.total || 1)) * 100}
              size={120}
              thickness={5}
              color="success"
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {summary.completed}/{summary.total}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" mt={2}>
            Pending: {summary.pending}
          </Typography>
        </Paper>

        {/* Donut Chart */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            flex: "1 1 350px",
            maxWidth: 420,
            minWidth: 300,
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            🍩 Pending vs Completed
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Tooltip content={<DonutTooltip />} />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* ---- Weekly Orders Trend ---- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Section title="📅 Weekly Orders Trend">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={COLORS.weekly}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography align="center" mt={3} color="text.secondary">
              No weekly data available
            </Typography>
          )}
        </Section>
      </motion.div>

      {/* ---- Salesman Orders + Leaderboard ---- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Section title="👨‍💼 Orders by Salesman">
          {salesmanData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={salesmanData}
                  layout="vertical"
                  margin={{ left: -35 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="salesman" width={220} />
                  <Tooltip content={<SalesmanTooltip />} />
                  <Bar
                    dataKey="orders"
                    fill={COLORS.completed}
                    barSize={25}
                    radius={[6, 6, 6, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <Box mt={3}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  🏆 Top Salesmen (Completed)
                </Typography>
                {topSalesmen.length > 0 ? (
                  topSalesmen.map((s, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={1.5}
                      mt={1}
                      borderRadius="12px"
                      bgcolor={i === 0 ? "#e8f5e9" : "#f5f5f5"}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmojiEvents color={i === 0 ? "warning" : "disabled"} />
                        <Typography>{s.salesman}</Typography>
                      </Box>
                      <Typography fontWeight={700}>
                        {s.orders} completed
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" mt={1}>
                    No completed orders in the selected range.
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Typography align="center" mt={3} color="text.secondary">
              No salesman data available
            </Typography>
          )}
        </Section>
      </motion.div>

      {/* ---- Monthly Status Trends ---- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Section title="📊 Monthly Order Status">
          {statusTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={statusTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Pending"
                  fill={COLORS.pending}
                  barSize={22}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Completed"
                  fill={COLORS.completed}
                  barSize={22}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Cancelled"
                  fill={COLORS.cancelled}
                  barSize={22}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography align="center" mt={3} color="text.secondary">
              No monthly data available
            </Typography>
          )}
        </Section>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;
