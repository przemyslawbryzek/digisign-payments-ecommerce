import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api";
import ProductImageSlider from "../components/ImageSlider"
export default function Product({onAddToCart}){
    const { id } = useParams();
    const [product, setProduct] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(false);
    
    useEffect(() => {
        api.get(`/products/${id}`).then((res) => setProduct(res.data));
    }, [id]);
    useEffect(() => {
        if (product.images && product.images.length > 0) {
            setSelectedImage(product.images[0]);
        }
    }, [product]);
    return(
        <div className="flex flex-col md:flex-row justify-center items-centers p-20 gap-8">
                <ProductImageSlider product={product} />
                <div className="flex flex-col gap-8 pl-20 w-100 items-centers justify-center">
                    <h1 className="p-2">{product.name}</h1>
                    <p className="p-2">{product.price} PLN</p>
                    <button onClick={() =>api.post(
                        "/cart",
                        { product_id: product.id, quantity: 1 }).then(()=>{onAddToCart();})
                    }
                    className="bg-black text-white p-2 hover:bg-white hover:text-black border-1 border-black duration-300">Add to Bag</button>
                    <div className="p-2">
                        <div 
                        onClick={() => setSelectedDescription(!selectedDescription)}
                        className="flex flex-row justify-between group">
                            <p className="group-hover:text-stone-500">DESCRIPTION</p>
                            <p>{selectedDescription
                                ?"-"
                                :"+"
                            }</p>
                        </div>
                        <p className={selectedDescription
                                ?""
                                :"invisible"
                            }>{product.description}</p>
                    </div>
                </div>
            </div>
    );
}