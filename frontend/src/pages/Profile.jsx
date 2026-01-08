import { useEffect, useState, useContext} from "react";
import { api } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BsPerson } from "react-icons/bs";

export default function Profile(){
    const [user, setUser] = useState([]);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const { isAdmin } = useContext(AuthContext);

    useEffect(() => {
        Promise.all([
            api.get("/profile"),
            api.get("/orders")
        ]).then(([profileRes, ordersRes]) => {
            setUser(profileRes.data);
            setOrders(ordersRes.data);
        });
    }, []);
    return(
        <div className="flex flex-col p-10 md:p-0  md:w-1/2 m-auto gap-8">
            <div className="flex flex-row items-center border-b-1 border-b-stone-300 p-6 justify-around">
                <div className="flex flex-col text-center items-center">
                    <p className="text-9xl"><BsPerson /></p>
                    <p>{user.email}</p>
                </div>
                <button onClick={() => {
                    logout();
                    navigate("/");
                }}
                className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300 w-1/3">
                    Log Out
                </button>
                {isAdmin && (
                    <Link to="/admin" className="ml-4 underline">Admin Dashboard</Link>
                )}
            </div>
            <div className="flex flex-col w-3/4 gap-6 m-auto">
                <h1 className="text-xl">Orders</h1>
                <table className="border-collapse">
                    <thead>
                        <tr className="text-left border-b-1 border-b-stone-300">
                            <th className="p-2 align-top">Order</th>
                            <th className="p-2 align-top">Date</th>
                            <th className="p-2 align-top">Status</th>
                            <th className="p-2 align-top">Subtotal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{ orders.map(order => (
                        <tr className="border-b-1 border-b-stone-300">
                            <td className="py-4 pl-2 text-left align-top">
                                <Link to={`/orders/${order.order_id}`} className="border-b-1 border-b-white hover:border-b-black">{order.order_id}</Link>
                            </td>
                            <td className="py-4 pl-2 text-left align-top">{order.date}</td>
                            <td className="py-4 pl-2 text-left align-top">{order.status}</td>
                            <td className="py-4 pl-2 text-left align-top">{order.total_amount+" PLN"}</td>
                            <td className="py-4 pl-2 text-left align-top">
                                {
                                    order.status === "paid" || order.status === "shipped"
                                    ? <button onClick={() => api.get(`/orders/${order.order_id}/pdf`, {responseType: "blob"})
                                    .then((res) => {
                                        const fileURL = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
                                        const link = document.createElement("a");
                                        link.href = fileURL;
                                        link.download = `order_${order.order_id}.pdf`;
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(fileURL);
                                    })
                                    .catch((err) => console.error("Błąd pobierania PDF:", err))}
                                    className="border-b-1 border-b-white hover:border-b-black">
                                        Get Signed PDF
                                    </button>
                                    : <button onClick={()=> api.post("/payment/create-session", { order_id: order.order_id })
                                    .then((res) => window.location.href = res.data.checkout_url)}
                                    className="border-b-1 border-b-white hover:border-b-black">
                                        Pay Order
                                    </button>
                                }
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    )
}