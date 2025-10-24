import ReactDOM from "react-dom";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate} from "react-router-dom";
import { api } from "../api/api";
import { LuTrash } from "react-icons/lu";
import  QuantityInput  from "./QuantityInput"
import { AuthContext } from "../context/AuthContext";

export default function Cart({onClose}){
    const [CartItems, setCartItems] = useState([]);
    const { isLogged } = useContext(AuthContext);
    const navigate = useNavigate();

    const updateQuantity = (id, qty, currentQty) => {
        api.post(
            "/cart",
            { product_id: id, quantity: qty - currentQty }
        )
        .then(() => api.get("/cart").then((res) => setCartItems(res.data))); 
        };

    useEffect(() => {
        api.get("/cart").then((res) => setCartItems(res.data));
    }, []);
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 z-50">
            <div className="bg-white h-full w-full md:w-1/2 lg:w-1/2 xl:w-1/4 float-right shadow-lg relative">
                <div className="w-full flex flex-row justify-between p-4">
                    <h1>SHOPPING BAG</h1>
                    <button onClick={onClose}
                    className="text-right text-gray-600 hover:text-black text-xl">
                        ✕
                    </button>
                </div>
                <div className={`flex flex-col text-center h-full ${
                    CartItems.length === 0 ? "justify-center" : ""
                }`}>
                {CartItems.length === 0
                    ? <p>YOUR SHOPPING BAG IS CURRENTLY EMPTY</p>
                    :  (<div className="h-full flex flex-col">
                            <div className="h-2/3 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
                            {CartItems.map(item  => (
                            <div key={item.product_id} className="p-6 flex flex-row justify-between">
                                <img 
                                    src={`http://127.0.0.1:5000${item.images[0]}`}
                                    className="w-25 h-25"
                                />
                                <div className="flex flex-col justify-between text-left w-full pl-2">
                                    <Link to={`/products/${item.product_id}`}
                                        className="hover:border-b-1 self-start">
                                            {item.name}
                                        </Link>
                                    <p>{item.price+" PLN"}</p>
                                    <QuantityInput
                                        value={item.quantity}
                                        onChange={(newQty) => updateQuantity(item.product_id, newQty, item.quantity)}
                                    />
                                </div>
                                <div className="flex flex-col justify-between items-end text-nowrap">
                                <button onClick={() =>api.delete(`/cart/${item.product_id}`)
                                    .then(() => api.get("/cart"))
                                    .then((res) => setCartItems(res.data))
                                }
                                >
                                    <LuTrash />
                                </button>
                                <p>{(item.price * item.quantity).toFixed(2) +" PLN"}</p>
                                </div>
                            </div>
                            ))}
                            </div>
                            <div className="flex flex-col gap-4 border-t-1 border-t-stone-200 w-full p-6 justify-center items-center">
                                <div className="w-full flex flex-row justify-between">
                                    <p>Subtotal</p>
                                    <p>{CartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)+" PLN"}</p>
                                </div>
                                <button onClick={() => {
                                    if (isLogged) {
                                    api.post("/checkout")
                                        .then((res) => navigate("/orders/" + res.data.order_id))
                                        .then(api.delete("/cart"))
                                        .finally(() => onClose());
                                    } else {
                                    navigate("/login");
                                    onClose();
                                    }
                                }}
                                className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300 w-full">
                                    Checkout
                                </button>
                                <button onClick={() =>api.delete("/cart")
                                    .then(() => api.get("/cart"))
                                    .then((res) => setCartItems(res.data))
                                }
                                className="p-2 bg-white text-black border-1 border-black duration-300 hover:bg-stone-200 w-full">
                                    Clear Bag
                                </button>
                                <Link onClick={()=>onClose()} 
                                to="/cart" 
                                className="border-b-1 hover:border-b-2 w-50 text-center text-xs p-2">
                                    View Shopping Bag Details
                                </Link>
                            </div>
                        </div>
                        
                    )}
                </div>
            </div>
        </div>,document.body
    );
}