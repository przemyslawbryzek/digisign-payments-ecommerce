import { useEffect, useState } from "react";
import { api } from "../api/api";
import { AdminOverviewSection } from "../components/admin/AdminOverviewSection";
import { AdminOrdersSection } from "../components/admin/AdminOrdersSection";
import { AdminProductsSection } from "../components/admin/AdminProductsSection";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:"", price:0, stock:0, category:"", description:"", image_urls: [] });
  const [activeSection, setActiveSection] = useState("overview");

  const loadAll = async () => {
    const [m, o, p] = await Promise.all([
      api.get("/admin/metrics"),
      api.get("/admin/orders"),
      api.get("/products")
    ]);
    setMetrics(m.data);
    setOrders(o.data);
    setProducts(p.data);
  };

  useEffect(() => { loadAll(); }, []);

  const updateOrderStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}`, { status });
    await loadAll();
  };

  const createProduct = async () => {
    await api.post("/admin/products", {
      ...newProduct,
      image_urls: JSON.stringify(newProduct.image_urls || []),
    });
    setNewProduct({ name:"", price:0, stock:0, category:"", description:"", image_urls: [] });
    await loadAll();
  };

  const updateProduct = async (id, patch) => {
    await api.put(`/admin/products/${id}`, {
      ...patch,
      image_urls: JSON.stringify(patch.image_urls || []),
    });
    await loadAll();
  };

  const deleteProduct = async (id) => {
    await api.delete(`/admin/products/${id}`);
    await loadAll();
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex justify-center">
        {["overview", "orders", "products"].map(key => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-3 py-1 hover:border-b-2 ${activeSection === key ? "border-b-2" : ""}`}
          >
            {key}
          </button>
        ))}
      </div>

      {activeSection === "overview" && (
        <AdminOverviewSection metrics={metrics} orders={orders} />
      )}

      {activeSection === "orders" && (
        <AdminOrdersSection
          orders={orders}
          onUpdateStatus={updateOrderStatus}
        />
      )}

      {activeSection === "products" && (
        <AdminProductsSection
          products={products}
          newProduct={newProduct}
          onChangeNewProduct={setNewProduct}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
        />
      )}
    </div>
  );
}