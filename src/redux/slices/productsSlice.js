import { createSlice } from '@reduxjs/toolkit';
import { getProducts, getProduct } from '../../api/products';

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
  filters: {
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '',
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.pages = action.payload.pages;
    },
    setProduct: (state, action) => {
      state.product = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearProduct: (state) => {
      state.product = null;
    },
  },
});

export const { setLoading, setProducts, setProduct, setFilters, setError, clearProduct } = productsSlice.actions;

export const fetchProducts = (params = {}) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const filters = getState().products.filters;
    const response = await getProducts({ ...filters, ...params });
    dispatch(setProducts(response.data));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch products'));
    dispatch(setLoading(false));
  }
};

export const fetchProduct = (slug) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await getProduct(slug);
    dispatch(setProduct(response.data.data));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch product'));
    dispatch(setLoading(false));
  }
};

export default productsSlice.reducer;
