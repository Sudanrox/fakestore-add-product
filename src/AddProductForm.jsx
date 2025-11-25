import React, { useState, useEffect } from "react";
import "./AddProductForm.css";

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "", // base64 string
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // products list (for table + cards)
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload -> Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => ({
        ...prev,
        image: base64String,
      }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage("Title is required.");
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage("Price must be a number greater than 0.");
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Description is required.");
      return false;
    }
    if (!formData.category.trim()) {
      setErrorMessage("Category is required.");
      return false;
    }
    if (!formData.image) {
      setErrorMessage("Please upload an image.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // Fetch products initially
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          price: Number(formData.price),
          description: formData.description,
          image: formData.image,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product. Please try again.");
      }

      const apiProduct = await response.json();
      console.log("API response:", apiProduct);

      // Build a product object to show immediately in the UI
      const newProduct = {
        ...apiProduct,
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image || apiProduct.image,
        rating: apiProduct.rating || { rate: 0, count: 0 },
      };

      // Add the new product to the top of the list
      setProducts((prev) => [newProduct, ...prev]);

      setSuccessMessage("Product added successfully!");
      setFormData({
        title: "",
        price: "",
        description: "",
        category: "",
        image: "",
      });
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled =
    isSubmitting ||
    !formData.title.trim() ||
    !formData.price ||
    Number(formData.price) <= 0 ||
    !formData.description.trim() ||
    !formData.category.trim() ||
    !formData.image;

  return (
    <div className="page-wrapper">
      <h1 className="page-title">FakeStore Product Dashboard</h1>

      {/* FORM */}
      <div className="add-product-container">
        <div className="form-card">
          <h2>Add New Product</h2>
          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Product title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="120"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Jackets, Electronics"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Image</label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {imagePreview && (
              <div className="image-preview">
                <p>Image Preview:</p>
                <img src={imagePreview} alt="Preview" />
              </div>
            )}

            {errorMessage && <p className="message error">{errorMessage}</p>}
            {successMessage && (
              <p className="message success">{successMessage}</p>
            )}

            <button type="submit" disabled={isDisabled}>
              {isSubmitting ? "Submitting..." : "Add Product"}
            </button>
          </form>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <section className="section">
        <h2>Products Table</h2>
        {isLoadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products to display.</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price ($)</th>
                  <th>Rating</th>
                  <th>Stock</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => {
                  const rating = p.rating?.rate ?? "N/A";
                  const stock = p.rating?.count ?? "N/A"; // FakeStore doesn't have stock, so we use rating.count as "stock"
                  return (
                    <tr key={p.id || index}>
                      <td>{p.id ?? index + 1}</td>
                      <td className="title-cell">{p.title}</td>
                      <td>{p.category}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>{rating}</td>
                      <td>{stock}</td>
                      <td>
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="table-image"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* PRODUCT CARDS */}
      <section className="section">
        <h2>Product Cards</h2>
        {isLoadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products to display.</p>
        ) : (
          <div className="product-grid">
            {products.map((p, index) => {
              const rating = p.rating?.rate ?? "N/A";
              return (
                <div className="product-card" key={p.id || index}>
                  <div className="product-image-wrapper">
                    {p.image && (
                      <img src={p.image} alt={p.title} loading="lazy" />
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{p.title}</h4>
                    <p className="product-price">
                      ${Number(p.price).toFixed(2)}
                    </p>
                    <p className="product-category">{p.category}</p>
                    <p className="product-rating">⭐ {rating}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AddProductForm;
