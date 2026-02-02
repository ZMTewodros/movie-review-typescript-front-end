"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api";
import { 
  Trash2, Edit, Eye, X, ChevronLeft, ChevronRight, 
  Film, Calendar, User, Video, Image as ImageIcon, Star, Feather, AlertCircle
} from "lucide-react";
import Image from "next/image";
import { isAxiosError } from "axios";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500&auto=format&fit=crop";

const cleanImageUrl = (url: string | undefined | null): string => {
  if (!url) return FALLBACK_IMAGE;
  const cleaned = url
    .replace(/^"image":\s*"/, "")
    .replace(/"$/, "")
    .replace(/,$/, "")
    .replace(/^"/, "")
    .trim();
  return (cleaned.startsWith("http") || cleaned.startsWith("/")) ? cleaned : FALLBACK_IMAGE;
};

interface Category { id: number; category: string; }
interface Movie {
  id: number; title: string; author: string; director: string;
  year: number; image: string; category_id: number;
  avgRating?: string; reviewCount?: number;
  MovieCategory?: { category: string };
}
interface Review { id: number; comment: string; rating: number; User?: { name: string }; }
interface MovieApiResponse { movies: Movie[]; totalPages: number; }

export default function ManageMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([]);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ 
    title: "", author: "", director: "", year: "", image: "", category_id: "" 
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<Category[]>("/categories");
      if (isMountedRef.current) setCategories(res.data || []);
    } catch (err) {
      console.error("Fetch categories failed:", err);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await api.get<MovieApiResponse>("/movies", { 
        params: { page: currentPage, limit },
        signal: abortControllerRef.current.signal 
      });
      if (isMountedRef.current) {
        setMovies(res.data.movies || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      if (err.name !== "CanceledError") console.error("Fetch movies failed", err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    fetchCategories();
    return () => { isMountedRef.current = false; };
  }, [fetchCategories]);

  useEffect(() => {
    if (mounted) fetchMovies();
  }, [mounted, fetchMovies]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ title: "", author: "", director: "", year: "", image: "", category_id: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setIsEditing(true);
    setSelectedId(movie.id);
    // FIXED: Added fallbacks to prevent .toString() on null/undefined
    setForm({
      title: movie.title || "", 
      author: movie.author || "", 
      director: movie.director || "",
      year: movie.year?.toString() || "", 
      image: movie.image || "", 
      category_id: movie.category_id?.toString() || ""
    });
    setShowModal(true);
  };

  const handleShowReviews = async (movie: Movie) => {
    try {
      const res = await api.get<Review[]>(`/reviews/movie/${movie.id}`);
      setSelectedReviews(res.data || []);
      setSelectedMovieTitle(movie.title);
      setShowReviewModal(true);
    } catch (err) {
      alert("Failed to load reviews");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) return alert("Please select a category");

    const payload = { 
      ...form,
      year: parseInt(form.year), 
      category_id: parseInt(form.category_id) 
    };

    try {
      if (isEditing && selectedId) {
        await api.put(`/movies/${selectedId}`, payload);
      } else {
        await api.post("/movies", payload);
      }
      setShowModal(false);
      fetchMovies();
    } catch (err: unknown) {
      if (isAxiosError(err)) alert(err.response?.data?.error || "Submission failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err) { 
      alert("Delete failed"); 
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Simplified Header - No double blue bars */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Movie Catalog</h2>
          <p className="text-gray-500 font-medium text-sm">Managing records for Admin: <span className="text-blue-600 font-bold"></span></p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          + Add New Movie
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bold text-gray-400 text-xs uppercase tracking-widest">Loading Library...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((m) => (
              <div key={m.id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="relative h-56 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                  <Image 
                    src={cleanImageUrl(m.image)} 
                    alt={m.title} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    unoptimized 
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black shadow-sm flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> 
                    {m.avgRating ? parseFloat(m.avgRating).toFixed(1) : "0.0"}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-md truncate mb-1">{m.title}</h3>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider mb-4">
                    {m.MovieCategory?.category || "General"} • {m.year}
                  </p>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => handleShowReviews(m)} 
                    className="w-full bg-gray-50 text-gray-600 py-2.5 rounded-xl text-[10px] font-black hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> REVIEWS ({m.reviewCount || 0})
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(m)} className="flex-1 p-2 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <Edit size={16} className="mx-auto" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="flex-1 p-2 border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <Trash2 size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-4 mt-8">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 rounded-xl border border-gray-200 disabled:opacity-20 hover:bg-white active:scale-90"><ChevronLeft size={18} /></button>
              <span className="font-black text-xs text-gray-400">PAGE {currentPage} OF {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 rounded-xl border border-gray-200 disabled:opacity-20 hover:bg-white active:scale-90"><ChevronRight size={18} /></button>
            </nav>
          )}
        </>
      )}

      {/* MODAL - MOVIE FORM */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{isEditing ? "Edit Movie" : "Add Movie"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div className="space-y-3">
                <div className="relative">
                  <Film className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Movie Title" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="relative">
                  <Feather className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Author" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required placeholder="Director" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" value={form.director} onChange={e => setForm({...form, director: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required type="number" placeholder="Year" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                  </div>
                </div>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Poster Image URL" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                </div>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id.toString()}>{c.category}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                {isEditing ? "Update Movie" : "Create Movie"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                <h2 className="font-black text-gray-800 text-md uppercase truncate mr-4">Reviews: {selectedMovieTitle}</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
             </div>
             <div className="p-5 overflow-y-auto space-y-3 bg-gray-50/30">
                {selectedReviews.length > 0 ? selectedReviews.map(r => (
                  <article key={r.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[11px] text-blue-600 flex items-center gap-2 uppercase tracking-tight">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">{r.User?.name?.[0] || "U"}</div>
                        {r.User?.name || "User"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 text-[10px] font-black bg-amber-50 px-2 py-1 rounded-lg"><Star size={10} className="fill-amber-500"/> {r.rating}</div>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed italic">&quot;{r.comment}&quot;</p>
                  </article>
                )) : (
                  <div className="text-center py-12">
                    <Star size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-400 font-medium text-xs italic">No ratings found.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}