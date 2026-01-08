import { useState } from "react";

export function AdminProductsSection({ products, newProduct, onChangeNewProduct, onCreate, onUpdate, onDelete }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ ...product, image_urls: product.images || [] });
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const saveEdit = () => {
    onUpdate(editingProduct.id, { ...editForm, image_urls: editForm.image_urls || [] });
    closeEdit();
  };

  const parseImages = (value) =>
    value
      .split(/\n|,/)
      .map((v) => v.trim())
      .filter(Boolean);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Products</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-start">
        <input
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => onChangeNewProduct({ ...newProduct, name: e.target.value })}
          className="border-b-1 p-2"
        />
        <input
          placeholder="Price"
          type="number"
          value={newProduct.price}
          onChange={(e) => onChangeNewProduct({ ...newProduct, price: +e.target.value })}
          className="border-b-1 p-2"
        />
        <input
          placeholder="Stock"
          type="number"
          value={newProduct.stock}
          onChange={(e) => onChangeNewProduct({ ...newProduct, stock: +e.target.value })}
          className="border-b-1 p-2"
        />
        <input
          placeholder="Category"
          value={newProduct.category || ""}
          onChange={(e) => onChangeNewProduct({ ...newProduct, category: e.target.value })}
          className="border-b-1 p-2"
        />
        <input
          placeholder="Image URLs"
          value={(newProduct.image_urls || []).join("\n")}
          onChange={(e) => onChangeNewProduct({
            ...newProduct,
            image_urls: parseImages(e.target.value),
          })}
          className="border-b-1 p-2 min-w-[220px]"

        />
        <button onClick={onCreate} className="bg-black text-white px-4 py-2 hover:bg-white hover:text-black border-1 border-black duration-300">Create</button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b-1 border-b-stone-300">
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.images?.length || 0}</td>
              <td className="space-x-2">
                <button
                  onClick={() => openEdit(p)}
                  className="px-2 border-b-1 hover:border-b-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="px-2 my-2 border-b-1  hover:border-b-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeEdit}>
          <div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Edit Product #{editingProduct.id}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border-b-1 border-b-stone-300 focus:outline-none hover:border-b-black focus:border-b-black p-2 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border-b-1 border-b-stone-300 focus:outline-none hover:border-b-black focus:border-b-black p-2 "
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price || 0}
                  onChange={(e) => setEditForm({ ...editForm, price: +e.target.value })}
                  className="w-full border-b-1 border-b-stone-300 focus:outline-none hover:border-b-black focus:border-b-black p-2 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={editForm.stock || 0}
                  onChange={(e) => setEditForm({ ...editForm, stock: +e.target.value })}
                  className="w-full border-b-1 border-b-stone-300 focus:outline-none hover:border-b-black focus:border-b-black p-2 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category || ""}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full border-b-1 border-b-stone-300 focus:outline-none hover:border-b-black focus:border-b-black p-2 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (one per line)</label>
                <textarea
                  value={(editForm.image_urls || []).join("\n")}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    image_urls: parseImages(e.target.value),
                  })}
                  className="w-full border-b-1 border-b-stone-300 focus:outline-none hover:border-b-black focus:border-b-black p-2"
                  rows={3}
                />
                {editForm.image_urls && editForm.image_urls.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {editForm.image_urls.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${img}`}
                        alt={`preview-${idx}`}
                        className="w-16 h-16 object-cover border"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 bg-black text-white px-4 py-2  hover:bg-white hover:text-black border-1 border-black duration-300"
              >
                Save
              </button>
              <button
                onClick={closeEdit}
                className="flex-1 border px-4 py-2  hover:bg-gray-100 duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
