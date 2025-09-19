// AuthService.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);


// ================= AUTH APIs =================
export const loginAdmin = async (adminUserName, adminPassword) => {
  return axiosInstance.post("/api/AdminLogin", {
    AdminUserName: adminUserName,
    AdminPassword: adminPassword,
  });
};

export const loginSalesman = async (salesmanPin, salesmanPassword) => {
  const res = await axiosInstance.post("/api/SalesmanLogin", {
    SalesmanPin: salesmanPin,
    SalesmanPassword: salesmanPassword,
  });

  if (res.status === 200 && res.data) {
    localStorage.setItem("salesmanPin", salesmanPin);
  }

  return res;
};

export const logout = async () => {
  try {
    // Call backend logout to clear session cookie
    await axiosInstance.post("/api/Auth/logout");
    navigate("/");
    console.log("Logged out from backend successfully");
  } catch (err) {
    console.error("Backend logout failed:", err);
  }
};




// ================= CUSTOMER APIs =================
export const createCustomer = async (customerData) => {
  return axiosInstance.post("/api/Customer/create", customerData);
};

export const uploadCustomerImages = async (formData) => {
  return axiosInstance.post("/api/CustomerImages/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteCustomerimages = async (imageId) => {
  return axiosInstance.delete(`/api/CustomerImages/${imageId}`);
};

export const deleteAllCustomerimages = async (customerId) => {
  return axiosInstance.delete(`/api/CustomerImages/delete/${customerId}`);
};


export const getCustomerByPhone = async (phone) => {
  return axiosInstance.get(`/api/Customer/phone/${phone}`);
};

export const updateCustomer = async (data) => {
  return axiosInstance.patch(`/api/Customer/update`, data);
};

export const getCustomerImages = async (customerId) => {
  return axiosInstance.get(`/api/CustomerImages/${customerId}`);
};

export const deleteCustomer = async (customerId) => {
  return axiosInstance.delete(`/api/Customer/delete`, {
    data: { customerId }
  });
};

// ================= OTP APIs =================
export const otpsende = async (phone) => {
  const res = await axiosInstance.post(`/api/Otp/send`, { phone });
  return res.data;
};

export const otpverify = async (sessionId, otp) => {
  const res = await axiosInstance.post(`/api/Otp/verify`, { sessionId, otp });
  return res.data;
};

// ================= SALESMAN APIs =================
export const getAllSalesman = async () => {
  return axiosInstance.get(`/api/Salesmen/all`);
};

export const getSalesmanImage = async (salesmanPin) => {
  const res = await axiosInstance.get(
    `/api/SalesmanImages/by-pin/${salesmanPin}`
  );
  return res.data;
};

export const createNewSalesman = async (
  salesmanName,
  salesmanEmail,
  salesmanPassword,
  salesmanPhone
) => {
  const payload = {
    salesmanName,
    salesmanEmail,
    salesmanPassword,
    salesmanPhone,
  };
  const res = await axiosInstance.post(`/api/Salesmen/create`, payload);
  return res.data;
};

export const createSalesmanImages = async (salesmanPin, images) => {
  const formData = new FormData();
  formData.append("salesmanPin", salesmanPin);

  images.forEach((img) => {
    formData.append("images", img);
  });

  const res = await axiosInstance.post(`/api/SalesmanImages/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// UPDATED — Skip password if not provided
export const updateSalesman = async (payload) => {
  const res = await axiosInstance.put(`/api/Salesmen/update`, payload);
  return res.data;
};

export const deleteSalesmanImages = async (SalesmanImageId) => {
  return axiosInstance.delete(`/api/SalesmanImages/${SalesmanImageId}`);
};


export const deleteSalesman = async (salesmanPin) => {
  return axiosInstance.delete(`/api/Salesmen/delete/${salesmanPin}`);
};

export const deleteMultipleSalesmanImages = async (imageIds) => {
  return axiosInstance.post(`/api/SalesmanImages/bulk-delete`, imageIds);
};



export const getSalesmanByPin = async (salesmanPin) => {
  const res = await axiosInstance.get(`/api/Salesmen/${salesmanPin}`);
  return res.data;
};

export const getAllCustomers = async () => {
  return axiosInstance.get(`/api/Customer/get-all`);
};


//Customer Related APIs








