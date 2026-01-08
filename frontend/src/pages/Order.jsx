import { useState, useEffect } from "react";
import { useParams, Link} from "react-router-dom";
import { api } from "../api/api";
import { FaCcStripe } from "react-icons/fa";

export default function Order(){
    const { id } = useParams();
    const [order, setOrder] = useState({ items: [] })

    useEffect(() => {
        api.get("/orders/"+id).then((res) => setOrder(res.data));
    }, []);
    return (
        <div className="flex flex-col w-2/3 m-auto gap-6 pt-20">
            <h1 className="text-xl">ORDER BAG {order.items.reduce((sum, item) => sum + item.quantity, 0)}</h1>
            <div className="flex flex-col xl:flex-row gap-8 items-start">
                <table className="w-3/4 border-collapse mx-auto">
                    <thead>
                        <tr className="text-left border-b-1 border-b-stone-300">
                            <th className="p-2 align-top">{order.items.reduce((sum, item) => sum + item.quantity, 0)} Items</th>
                            <th className="p-2 align-top">Price</th>
                            <th className="p-2 align-top">Qty</th>
                            <th className="p-2 align-top">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item  => (
                            <tr className="border-b-1 border-b-stone-300">
                                <td className="flex flex-row p-4 gap-2 align-top">
                                    <img 
                                        src={`http://localhost:5000${item.images[0]}`}
                                        className="w-25 h-25 hidden xl:block"
                                    />
                                    <Link to={`/products/${item.product_id}`}
                                    className="hover:border-b-1 self-start">
                                        {item.product_name}
                                    </Link>
                                </td>
                                <td className="py-4 pl-2 text-left align-top">{item.price_at_purchase+" PLN"}</td>
                                <td className="py-4 pl-2 text-left align-top" >{item.quantity}</td>
                                <td className="py-4 pl-2 text-left align-top">{item.subtotal +" PLN"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex flex-col w-3/4 xl:w-1/4 gap-4 m-auto">
                    <h1 className="text-xl">ORDER SUMMARY</h1>
                    <div className="flex flex-row justify-between">
                        <p>Status</p>
                        <p>{order.status}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Date</p>
                        <p>{order.created_at}</p>
                    </div>
                    <div className="flex flex-row justify-between pt-4 border-t-1 border-t-stone-300">
                        <p>Subtotal</p>
                        <p>{order.total_amount+" PLN"}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Express Delivery</p>
                        <p>FREE</p>
                    </div>
                    <div className="flex flex-row justify-between pt-4 border-t-1 border-t-stone-300">
                        <p>Total</p>
                        <p>{order.total_amount+" PLN"}</p>
                    </div>
                    {
                        order.status === "paid" || order.status === "shipped"
                        ?(
                            <button onClick={() => api.get(`/orders/${id}/pdf`, {responseType: "blob"})
                                .then((res) => {
                                    const fileURL = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                                    const link = document.createElement("a");
                                    link.href = fileURL;
                                    link.download = `order_${id}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(fileURL);
                                })
                                .catch((err) => console.error("Błąd pobierania PDF:", err))}
                            className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300 w-full my-2">
                                Get Signed PDF
                            </button>
                        ) : (
                            <div>
                                <button onClick={()=> api.post("/payment/create-session", { order_id: id })
                                    .then((res) => window.location.href = res.data.checkout_url)
                                }
                                className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300 w-full my-2">
                                    Pay
                                </button>
                                <p className="mt-4 pt-6 border-t-1 border-t-stone-300" >ACCEPTED PAYMENT METHODS</p>
                                <p className="text-3xl"><FaCcStripe /></p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}