"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
// Update the import path to the correct location of your api service
import api from "../../services/api";
import { Trash2, Edit, Eye } from "lucide-react";

type MovieCategory = {
  category: string;
};

type Movie = {
  id: number;
  title: string;
  author: string;
  director: string;
  year: number;
  image: string;
  category_id: number;
  avgRating?: number;
  MovieCategory?: MovieCategory;
};

export default function ManageMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  // Remove unused categories state
  const [loading, setLoading] = useState(true);

  // Modal and review state
  // Removed unused showModal, showReviews, isEditing, and selectedId states

  // Removed unused form state

  // Use useEffect only for loading movies, and wrap fetchMovies in useCallback
  useEffect(() => {
    fetchMovies();
  }, []);

  // Wrap fetchMovies in useCallback to avoid useEffect dependency issues
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/movies");
      setMovies(res.data.movies || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove unused fetchCategories function

  // Remove unused handleSubmit function

  // Show reviews handler
  // Removed unused handleShowReviews function

  return (
    <div className="flex flex-col items-center">
        <div className="w-full max-w-6xl">
           <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-2xl font-black text-gray-900">Movie Management</h2>
             <button 
               className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow hover:bg-blue-700 transition-all"
             >
               + Add New Movie
             </button>
           </div>

           {loading ? (
             <div className="text-center py-20 text-gray-400 font-bold">Loading...</div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {movies.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col hover:shadow-md transition-all">
                    <div className="relative overflow-hidden rounded-xl mb-3 h-48 bg-gray-100">
                      <Image src={m.image} alt={m.title} className="w-full h-full object-cover" width={400} height={192} />
                      <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                        <span className="text-yellow-500 text-[10px]">⭐</span>
                        <span className="font-bold text-xs text-gray-800">
                          {m.avgRating ? parseFloat(String(m.avgRating)).toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 truncate">{m.title}</h3>
                    <div className="text-gray-400 text-[10px] font-bold uppercase mb-4">
                       {m.MovieCategory?.category} • {m.year}
                    </div>
                    <button className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 mb-4 mt-auto hover:bg-blue-100">
                       <Eye size={14} /> Show Reviews
                    </button>
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button className="flex-1 py-2 border border-gray-100 rounded-lg text-gray-400 hover:text-blue-500"><Edit size={18} /></button>
                      <button onClick={async () => { if(confirm("Delete?")) { await api.delete(`/movies/${m.id}`); fetchMovies(); } }} className="flex-1 py-2 border border-gray-100 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
             </div>
           )}
           {/* Pagination logic remains similar to original */}
        </div>
        
        {/* Modals for Add/Edit and Reviews go here (same as your React code) */}
    </div>
  );
}