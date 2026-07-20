import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createOrder, getMyOrders, getOrder } from "../../api/orders";
import { initiatePayment, checkPaymentStatus } from "../../api/payments";
import toast from "react-hot-toast";

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  paymentUrl: null,
  paymentInvoiceId: null,
};

// ✅ Async thunks
export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await createOrder(orderData);
      toast.success("Order created successfully!");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create order";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyOrders();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch orders";
      return rejectWithValue(message);
    }
  },
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getOrder(id);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch order";
      return rejectWithValue(message);
    }
  },
);

export const initiatePaymentThunk = createAsyncThunk(
  "orders/initiatePayment",
  async ({ orderId, paymentMethod = "checkout" }, { rejectWithValue }) => {
    try {
      const response = await initiatePayment(orderId, paymentMethod);
      toast.success("Payment initiated!");
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to initiate payment";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const checkPaymentStatusThunk = createAsyncThunk(
  "orders/checkPaymentStatus",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await checkPaymentStatus(orderId);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to check payment status";
      return rejectWithValue(message);
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearPaymentUrl: (state) => {
      state.paymentUrl = null;
      state.paymentInvoiceId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Order
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Initiate Payment
      .addCase(initiatePaymentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePaymentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentUrl = action.payload.paymentUrl;
        state.paymentInvoiceId = action.payload.invoiceId;
        if (action.payload.orderId) {
          state.currentOrder = {
            ...state.currentOrder,
            _id: action.payload.orderId,
          };
        }
      })
      .addCase(initiatePaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check Payment Status
      .addCase(checkPaymentStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Update current order if status changed
        if (state.currentOrder && action.payload.orderStatus) {
          state.currentOrder.status = action.payload.orderStatus;
          if (state.currentOrder.payment) {
            state.currentOrder.payment.paymentStatus =
              action.payload.paymentStatus;
          }
        }
      })
      .addCase(checkPaymentStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearPaymentUrl, clearError, clearOrders } =
  ordersSlice.actions;

export default ordersSlice.reducer;
