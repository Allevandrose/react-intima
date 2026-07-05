import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/slices/categoriesSlice";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/admin";
import Sidebar from "../../components/admin/Sidebar";
import { Plus, Edit, Trash2, X, Tag } from "lucide-react";
import toast from "react-hot-toast";

const CategoriesAdmin = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
        toast.success("Category updated successfully!");
      } else {
        await createCategory(formData);
        toast.success("Category created successfully!");
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", image: "" });
      dispatch(fetchCategories());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted successfully!");
        dispatch(fetchCategories());
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .lux-input:focus, .lux-textarea:focus {
          outline: none;
          border-color: #B08D4F;
          box-shadow: 0 0 0 1px #B08D4F;
        }
      `}</style>
      <Sidebar />
      <div className="flex-1 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#E6DFD1]">
          <h1 className="font-display text-3xl text-[#14120F]">Categories</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", description: "", image: "" });
              setShowModal(true);
            }}
            className="bg-[#14120F] text-[#F7F3EA] px-5 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[#B08D4F] border-t-transparent"></div>
            <p className="mt-4 text-[#8C7B6B] text-sm tracking-wide">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E6DFD1]">
            <Tag
              className="w-12 h-12 text-[#D8CFBC] mx-auto mb-5"
              strokeWidth={1.25}
            />
            <h3 className="font-display text-xl text-[#14120F] mb-2">
              No categories yet
            </h3>
            <p className="text-[#8C7B6B] text-sm">
              Create categories to organize your products
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white border border-[#E6DFD1] p-5"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-3.5">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover border border-[#E6DFD1]"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#FBF9F4] border border-[#E6DFD1] flex items-center justify-center">
                        <span className="font-display text-[#B08D4F] font-medium text-xl">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-base text-[#14120F]">
                        {category.name}
                      </h3>
                      <p className="text-xs text-[#8C7B6B] mt-0.5">
                        Slug: {category.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-[#5C5348] hover:text-[#B08D4F] transition-colors"
                    >
                      <Edit className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="p-1.5 text-[#B7AC98] hover:text-[#8C4B3A] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-[#5C5348] line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="mt-3">
                  <span
                    className={`px-2.5 py-1 text-[11px] uppercase tracking-wide ${category.isActive ? "bg-[#EAF0EC] text-[#1F3D33]" : "bg-[#F3EAE5] text-[#8C4B3A]"}`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#14120F]/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-7">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl text-[#14120F]">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#8C7B6B] hover:text-[#14120F] transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Category Name <span className="text-[#8C4B3A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="lux-input w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="lux-textarea w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="lux-input w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300"
                  >
                    {editingCategory ? "Update Category" : "Create Category"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white border border-[#D8CFBC] text-[#5C5348] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#FBF9F4] transition-colors duration-300"
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

export default CategoriesAdmin;
