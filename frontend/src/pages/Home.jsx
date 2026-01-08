import { useEffect, useState } from "react";
import { api } from "../api/api";
import ProductPortal from "../components/ProductPortal";
import {Link} from "react-router-dom";

export default function Home({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-4 text-center ">Produkty</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 p-4">
        {products.map((p) => (
          <div key={p.id} className="">
            <div className="group relative flex flex-col-reverse ">
              <Link to={`/products/${p.id}`} className="duration-300 z-10 group-hover:opacity-0 group-hover:z-0"> 
              <img src={`http://localhost:5000${p.images[0]}`} alt={p.name}
              className="h-auto w-full object-cover" /></Link>
              <button onClick={() => setSelectedProduct(p)}
              className="absolute text-white bg-stone-700 w-full h-1/8">
              Quick View
              </button>
            </div>
            <h2 className="text-center mt-2 p-3">{p.name}</h2>
            <p className="text-center text-xs p-3">{p.price} PLN</p>
          </div>
        ))}
      </div>
      {selectedProduct && (
        <ProductPortal
          product={selectedProduct}
          onAddToCart={onAddToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
