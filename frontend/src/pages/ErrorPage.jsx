import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const errData = sessionStorage.getItem("error");
    if (errData) {
      setError(JSON.parse(errData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!error) return null;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">Error {error.code}</h1>
      <p className="text-lg mb-6">{error.message}</p>
      <button
        onClick={() => navigate("/")}
        className="bg-black text-white px-4 py-2 border-1 border-black hover:bg-white hover:text-black transition"
      >
        Go Back
      </button>
    </div>
  );
}
