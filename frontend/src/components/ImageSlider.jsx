import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductImageSlider({ product }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = product.images.map((img) => `http://localhost:5001${img}`);
  const total = images.length;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      <div className="md:flex xl:flex-col gap-3 overflow-x-auto md:overflow-y-auto xl:h-150 xl:w-24 hidden">
        {images.map((img, index) => (
          <img
            key={index}
            onClick={() => setCurrentIndex(index)}
            src={img}
            alt={`${product.name} ${index + 1}`}
            className={`w-20 h-24 object-cover  cursor-pointer transition-all duration-200 ${
              currentIndex === index
                ? "border-b-1 border-b-black"
                : ""
            }`}
          />
        ))}
      </div>

      <div className="relative flex  justify-center flex-1">
        <img
          src={images[currentIndex]}
          alt={product.name}
          className="object-contain w-150 h-150 transition-all duration-500"
        />
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
        >
          <ChevronRight size={24} />
        </button>
        <div className="absolute bottom-15 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-black" : "bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
