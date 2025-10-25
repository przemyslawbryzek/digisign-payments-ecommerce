import ReactDOM from "react-dom";
import {Link} from "react-router-dom";
import { useState } from "react";
import { api } from "../api/api";
import ProductImageSlider from "./ImageSlider"
export default function ProductPortal({ product, onAddToCart, onClose }) {

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 flex justify-center p-20 z-50">
        <div className="bg-white p-6 w-auto shadow-lg relative overflow-y-auto md:overflow-y-hidden">
            <button
            onClick={onClose}
            className="text-right w-full text-gray-600 hover:text-black text-xl"
            >
            ✕
            </button>
            <div className="flex flex-col md:flex-row gap-6 h-full pt-10 items-center md:items-start">
                <ProductImageSlider product={product} />
                <div className="flex flex-col gap-8 w-75">
                    <h1 className="p-2">{product.name}</h1>
                    <p className="p-2">{product.price} PLN</p>
                    <button onClick={() =>api.post(
                        "/cart",
                        { product_id: product.id, quantity: 1 }) 
                        .then(() => {
                            onClose();     
                            onAddToCart();  
                        })}
                    className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300">
                        Add to Bag
                    </button>
                    <Link to={`/products/${product.id}`} className="border-b-1 hover:border-b-2 text-center">View Full Item Information</Link>
                </div>
            </div>
        </div>
    </div>,
    document.body
  );
}
