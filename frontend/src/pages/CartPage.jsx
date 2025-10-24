import { useState, useEffect, useContext } from "react";
import { api } from "../api/api";
import { LuTrash } from "react-icons/lu";
import {Link, useNavigate} from "react-router-dom";
import  QuantityInput  from "../components/QuantityInput"
import { FaChevronLeft } from "react-icons/fa6";
import { FaCcStripe } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

export default function CartPage(){
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
    return(
        CartItems.length === 0
        ? <p className="text-center text-2xl p-20">YOUR SHOPPING BAG IS CURRENTLY EMPTY</p>
        :(
        <div className="flex flex-col p-5 gap-10">
            <Link to="/"
            className="inline-flex items-center gap-1">
                <FaChevronLeft />
                <p className="border-b-white border-b-1 hover:border-b-black">Continue Shopping</p>
            </Link>
            <div className="flex flex-col w-2/3 m-auto gap-6">
                <h1 className="text-xl">SHOPPING BAG {CartItems.reduce((sum, item) => sum + item.quantity, 0)}</h1>
                <div className="flex flex-col xl:flex-row gap-8 items-start">
                    <table className="w-3/4 border-collapse mx-auto">
                        <thead>
                            <tr className="text-left border-b-1 border-b-stone-300">
                                <th className="p-2 align-top">{CartItems.reduce((sum, item) => sum + item.quantity, 0)} Items</th>
                                <th className="p-2 align-top">Price</th>
                                <th className="p-2 align-top">Qty</th>
                                <th className="p-2 align-top">Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {CartItems.map(item  => (
                                <tr className="border-b-1 border-b-stone-300">
                                    <td className="flex flex-row p-4 gap-2 align-top">
                                        <img 
                                            src={`http://127.0.0.1:5000${item.images[0]}`}
                                            className="w-25 h-25 hidden xl:block"
                                        />
                                        <Link to={`/products/${item.product_id}`}
                                        className="hover:border-b-1 self-start">
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className="py-4 pl-2 text-left align-top">{item.price+" PLN"}</td>
                                    <td className="py-4 pl-2 text-left align-top" >
                                        <QuantityInput
                                            value={item.quantity}
                                            onChange={(newQty) => updateQuantity(item.product_id, newQty, item.quantity)}
                                        />
                                    </td>
                                    <td className="py-4 pl-2 text-left align-top">{(item.price * item.quantity).toFixed(2) +" PLN"}</td>
                                    <td className="py-4 pl-2 text-left align-top">
                                        <button onClick={() =>api.delete(`/cart/${item.product_id}`)
                                            .then(() => api.get("/cart"))
                                            .then((res) => setCartItems(res.data))
                                        }>
                                            <LuTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex flex-col w-3/4 xl:w-1/4 gap-4 m-auto">
                        <h1 className="text-xl">ORDER SUMMARY</h1>
                        <div className="flex flex-row justify-between">
                            <p>Subtotal</p>
                            <p>{CartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)+" PLN"}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                            <p>Express Delivery</p>
                            <p>FREE</p>
                        </div>
                        <div className="flex flex-row justify-between pt-4 border-t-1 border-t-stone-300">
                            <p>Estimated Total</p>
                            <p>{CartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)+" PLN"}</p>
                        </div>
                        <button onClick={() => isLogged
                            ? api.post("/checkout")
                            .then((res) => api.delete("/cart").finally(() => navigate("/orders/" + res.data.order_id)))
                            : navigate("/login")
                        }
                        className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300 w-full my-2">
                            Checkout
                        </button>
                        <p className="pt-6 border-t-1 border-t-stone-300" >ACCEPTED PAYMENT METHODS</p>
                        <p className="text-3xl"><FaCcStripe /></p>
                    </div>
                </div>
            </div>
        </div>
    ))
}