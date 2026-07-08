/**
 * ProductsAdmin — refined back-office styling with SweetAlert
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productsSlice";
import { fetchCategories } from "../../redux/slices/categoriesSlice";
import { createProduct, updateProduct, deleteProduct } from "../../api/admin";
import Sidebar from "../../components/admin/Sidebar";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Package,
  PlusCircle,
  MinusCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ProductsAdmin = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    stock: "",
    isFeatured: false,
    hasVariants: false,
    variants: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newVariant, setNewVariant] = useState({
    color: "",
    size: "",
    stock: "",
    price: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleVariantInputChange = (e) => {
    const { name, value } = e.target;
    setNewVariant({ ...newVariant, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const previews = newFiles.map((file) =>
      file instanceof File ? URL.createObjectURL(file) : file,
    );
    setImagePreviews(previews);
  };

  // ✅ Updated with SweetAlert
  const removeImage = async (index) => {
    const fileToRemove = imageFiles[index];

    // If it's an existing image, confirm removal
    if (!(fileToRemove instanceof File)) {
      const result = await Swal.fire({
        title: "Remove Image?",
        text: "This image will be permanently deleted from the product.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8C4B3A",
        cancelButtonColor: "#14120F",
        confirmButtonText: "Yes, Remove",
        cancelButtonText: "Cancel",
        background: "#F7F3EA",
      });

      if (!result.isConfirmed) return;
    }

    if (fileToRemove instanceof File) {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    } else {
      const imagePath = fileToRemove;
      setImagesToRemove([...imagesToRemove, imagePath]);

      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    }
  };

  // ✅ Updated with SweetAlert
  const addVariant = () => {
    if (newVariant.color || newVariant.size) {
      // Check if variant already exists
      const exists = formData.variants.some(
        (v) => v.color === newVariant.color && v.size === newVariant.size,
      );
      if (exists) {
        toast.error("This variant already exists");
        return;
      }

      setFormData({
        ...formData,
        variants: [
          ...formData.variants,
          {
            color: newVariant.color || "",
            size: newVariant.size || "",
            stock: parseInt(newVariant.stock) || 0,
            price: parseFloat(newVariant.price) || 0,
          },
        ],
      });
      setNewVariant({ color: "", size: "", stock: "", price: "" });
      toast.success("Variant added");
    } else {
      toast.error("Please enter at least a color or size");
    }
  };

  // ✅ Updated with SweetAlert
  const removeVariant = async (index) => {
    const variant = formData.variants[index];
    const result = await Swal.fire({
      title: "Remove Variant?",
      text: `Remove ${variant.color || variant.size || "variant"} from the product?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8C4B3A",
      cancelButtonColor: "#14120F",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      background: "#F7F3EA",
    });

    if (result.isConfirmed) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: updatedVariants });
      toast.success("Variant removed");
    }
  };

  // ✅ Updated with SweetAlert validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate variants
    if (formData.hasVariants && formData.variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("isFeatured", formData.isFeatured);

    if (formData.hasVariants) {
      formDataToSend.append("variants", JSON.stringify(formData.variants));
    } else {
      formDataToSend.append("stock", formData.stock || 0);
    }

    imageFiles.forEach((file) => {
      if (file instanceof File) {
        formDataToSend.append("images", file);
      }
    });

    if (editingProduct && imagesToRemove.length > 0) {
      formDataToSend.append("removeImages", JSON.stringify(imagesToRemove));
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formDataToSend);
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Product has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
          timerProgressBar: true,
        });
      } else {
        await createProduct(formDataToSend);
        await Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Product has been created successfully.",
          timer: 2000,
          showConfirmButton: false,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
          timerProgressBar: true,
        });
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData(initialFormState);
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToRemove([]);
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  // ✅ Updated with SweetAlert
  const handleDelete = async (id, productName) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8C4B3A",
      cancelButtonColor: "#14120F",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#F7F3EA",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product has been deleted.",
          timer: 1500,
          showConfirmButton: false,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
        });
        dispatch(fetchProducts());
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEdit = (product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    setEditingProduct(product);

    const existingImages = product.images || [];
    const existingPreviews = existingImages.map((img) => img);

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      images: existingImages,
      stock: product.stock || "",
      isFeatured: product.isFeatured || false,
      hasVariants: hasVariants,
      variants: hasVariants ? product.variants : [],
    });

    setImageFiles(existingImages);
    setImagePreviews(existingPreviews);
    setImagesToRemove([]);
    setShowModal(true);
  };

  const getTotalStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  // ✅ IMPROVED: Show variant details including prices
  const getVariantDisplay = (variants) => {
    if (!variants || variants.length === 0) return "No variants";

    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
    const hasPrices = variants.some((v) => v.price > 0);

    let display = [];
    if (colors.length) display.push(`${colors.length} color(s)`);
    if (sizes.length) display.push(`${sizes.length} size(s)`);
    if (hasPrices) display.push("with prices");

    return display.join(", ") || "Variants";
  };

  // ✅ NEW: Get variant price range
  const getVariantPriceRange = (variants) => {
    if (!variants || variants.length === 0) return null;
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-[#FBF9F4] border border-[#E6DFD1] text-sm text-[#14120F] placeholder:text-[#B7AC98] focus:outline-none focus:border-[#B08D4F] transition-colors";

  return (
    <div className="flex min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <Sidebar />

      <div className="flex-1 p-6 sm:p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-2xl text-[#14120F]">Products</h1>
            <p className="text-xs text-[#8C7B6B] tracking-wide mt-1">
              {products.length} item{products.length === 1 ? "" : "s"} in
              catalog
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData(initialFormState);
              setImageFiles([]);
              setImagePreviews([]);
              setImagesToRemove([]);
              setShowModal(true);
            }}
            className="bg-[#14120F] text-[#F7F3EA] px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-[3px] border-[#B08D4F] border-t-transparent"></div>
            <p className="mt-4 text-sm text-[#8C7B6B] tracking-wide">
              Loading products…
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E6DFD1]">
            <Package
              className="w-12 h-12 text-[#D8CFBC] mx-auto mb-4"
              strokeWidth={1.25}
            />
            <h3 className="font-display text-xl text-[#14120F]">
              No products yet
            </h3>
            <p className="text-[#8C7B6B] text-sm mt-1">
              Start adding products to your store
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6DFD1] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FBF9F4] border-b border-[#E6DFD1]">
                  <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B]">
                    <th className="px-6 py-3.5 font-medium">Product</th>
                    <th className="px-6 py-3.5 font-medium">Price</th>
                    <th className="px-6 py-3.5 font-medium">Category</th>
                    <th className="px-6 py-3.5 font-medium">Stock</th>
                    <th className="px-6 py-3.5 font-medium">Variants</th>
                    <th className="px-6 py-3.5 font-medium">Variant Prices</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE0]">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-[#FBF9F4] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover bg-[#EFEAE0]"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/40x40?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#EFEAE0] flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-[#B7AC98]" />
                            </div>
                          )}
                          <span className="font-medium text-[#14120F] text-sm">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#B08D4F] text-sm">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-[#5C5348] text-sm">
                        {product.category?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-[#5C5348] text-sm">
                        {getTotalStock(product)}
                      </td>
                      <td className="px-6 py-4 text-[#8C7B6B] text-sm">
                        {getVariantDisplay(product.variants)}
                      </td>
                      <td className="px-6 py-4 text-[#B08D4F] text-sm font-medium">
                        {getVariantPriceRange(product.variants) || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${
                            product.isActive
                              ? "text-[#1F3D33] bg-[#1F3D33]/10"
                              : "text-[#8C4B3A] bg-[#8C4B3A]/10"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-[#5C5348] hover:text-[#14120F] hover:bg-[#EFEAE0] transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(product._id, product.name)
                            }
                            className="p-1.5 text-[#8C4B3A] hover:bg-[#8C4B3A]/10 transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#14120F]/60 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
            <div className="bg-[#F7F3EA] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 sm:p-9">
              <div className="flex justify-between items-center mb-7 border-b border-[#E6DFD1] pb-5">
                <h2 className="font-display text-xl text-[#14120F]">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setImagesToRemove([]);
                  }}
                  className="text-[#8C7B6B] hover:text-[#14120F] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                encType="multipart/form-data"
              >
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      Base Price (KES) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Product Images (Max 5)
                  </label>
                  <div className="border border-dashed border-[#D8CFBC] p-5 hover:border-[#B08D4F] transition-colors bg-[#FBF9F4]">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload
                        className="w-6 h-6 text-[#B08D4F]"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm text-[#5C5348]">
                        Click to upload images
                      </span>
                      <span className="text-xs text-[#B7AC98]">
                        JPEG, PNG, WEBP, GIF (Max 5MB each)
                      </span>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {imagePreviews.map((preview, index) => {
                        const isExisting = !(imageFiles[index] instanceof File);
                        return (
                          <div
                            key={index}
                            className="relative w-20 h-20 overflow-hidden border border-[#E6DFD1]"
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=No+Image";
                              }}
                            />
                            {isExisting && (
                              <div className="absolute bottom-0 left-0 right-0 bg-[#14120F]/80 text-[#F7F3EA] text-[8px] uppercase tracking-wide text-center py-0.5">
                                Existing
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-0.5 right-0.5 bg-[#8C4B3A] text-white rounded-full p-0.5 hover:bg-[#73392D]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {editingProduct && imagesToRemove.length > 0 && (
                    <p className="text-xs text-[#8C4B3A] mt-2 tracking-wide">
                      {imagesToRemove.length} image(s) marked for removal
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasVariants"
                      checked={formData.hasVariants}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-[#14120F]"
                    />
                    <span className="text-sm text-[#5C5348]">
                      Product has variants
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-[#14120F]"
                    />
                    <span className="text-sm text-[#5C5348]">
                      Featured Product
                    </span>
                  </label>
                </div>

                {!formData.hasVariants ? (
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <div className="border border-[#E6DFD1] p-4 bg-[#FBF9F4]">
                    <h4 className="text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-3">
                      Product Variants
                    </h4>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <input
                        type="text"
                        name="color"
                        value={newVariant.color}
                        onChange={handleVariantInputChange}
                        placeholder="Color"
                        className="px-3 py-2 bg-white border border-[#E6DFD1] text-sm focus:outline-none focus:border-[#B08D4F] transition-colors"
                      />
                      <input
                        type="text"
                        name="size"
                        value={newVariant.size}
                        onChange={handleVariantInputChange}
                        placeholder="Size"
                        className="px-3 py-2 bg-white border border-[#E6DFD1] text-sm focus:outline-none focus:border-[#B08D4F] transition-colors"
                      />
                      <input
                        type="number"
                        name="stock"
                        value={newVariant.stock}
                        onChange={handleVariantInputChange}
                        placeholder="Stock"
                        className="px-3 py-2 bg-white border border-[#E6DFD1] text-sm focus:outline-none focus:border-[#B08D4F] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addVariant}
                        className="bg-[#14120F] text-[#F7F3EA] px-3 py-2 hover:bg-[#1F3D33] transition-colors flex items-center justify-center"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={newVariant.price}
                      onChange={handleVariantInputChange}
                      placeholder="Variant Price (KES) - Optional"
                      className="w-full px-3 py-2 bg-white border border-[#E6DFD1] text-sm focus:outline-none focus:border-[#B08D4F] transition-colors mb-2"
                    />

                    {formData.variants.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.variants.map((variant, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white border border-[#EFEAE0] p-2.5"
                          >
                            <div className="flex items-center gap-4 flex-wrap">
                              {variant.color && (
                                <span className="text-xs text-[#5C5348]">
                                  <span className="font-medium text-[#14120F]">
                                    Color:
                                  </span>{" "}
                                  {variant.color}
                                </span>
                              )}
                              {variant.size && (
                                <span className="text-xs text-[#5C5348]">
                                  <span className="font-medium text-[#14120F]">
                                    Size:
                                  </span>{" "}
                                  {variant.size}
                                </span>
                              )}
                              <span className="text-xs text-[#5C5348]">
                                <span className="font-medium text-[#14120F]">
                                  Stock:
                                </span>{" "}
                                {variant.stock}
                              </span>
                              <span className="text-xs font-medium text-[#B08D4F]">
                                {variant.price > 0
                                  ? formatCurrency(variant.price)
                                  : "Base price"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-[#8C4B3A] hover:text-[#73392D]"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.variants.length > 0 && (
                      <p className="text-xs text-[#8C7B6B] mt-2 tracking-wide">
                        {formData.variants.length} variant(s) configured
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300"
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setImagesToRemove([]);
                    }}
                    className="flex-1 border border-[#D8CFBC] text-[#14120F] py-3 text-xs uppercase tracking-[0.2em] hover:border-[#14120F] transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsAdmin;
