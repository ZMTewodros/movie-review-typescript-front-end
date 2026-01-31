"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api";
import { 
  Trash2, Edit, Eye, X, ChevronLeft, ChevronRight, 
  Film, Calendar, User, Video, Image as ImageIcon, Star, Feather
} from "lucide-react";
import Image from "next/image";
import { isAxiosError } from "axios";

// Placeholder for broken image URLs
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500&auto=format&fit=crop";

// --- Types ---
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
  
  // Initial form state
  const [form, setForm] = useState({ 
    title: "", 
    author: "", 
    director: "", 
    year: "", 
    image: "", 
    category_id: "" 
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setShowReviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<Category[]>("/categories");
      if (isMountedRef.current) {
        // Ensure we always have an array
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error("Fetch categories failed:", err);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    try {
      const res = await api.get<MovieApiResponse>("/movies", { 
        params: { page: currentPage, limit },
        signal 
      });
      if (isMountedRef.current && !signal.aborted) {
        setMovies(res.data.movies || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "CanceledError") {
        console.error("Fetch movies failed", err);
      }
    } finally {
      if (isMountedRef.current && !signal.aborted) setLoading(false);
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
    return () => abortControllerRef.current?.abort();
  }, [mounted, fetchMovies]);

  // Handlers
  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ title: "", author: "", director: "", year: "", image: "", category_id: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setIsEditing(true);
    setSelectedId(movie.id);
    setForm({
      title: movie.title, 
      author: movie.author || "", 
      director: movie.director,
      year: movie.year.toString(), 
      image: movie.image, 
      category_id: movie.category_id.toString() // Convert to string for the select element
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
    
    // Validation
    if (!form.category_id) {
      alert("Please select a category");
      return;
    }

    const payload = { 
      title: form.title.trim(), 
      author: form.author.trim(),
      director: form.director.trim(), 
      image: form.image.trim(),
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
      if (isAxiosError(err)) {
        alert(err.response?.data?.error || "Submission failed. Please check your data.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      await api.delete(`/movies/${id}`);
      if (movies.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchMovies();
      }
    } catch (err) { 
      alert("Delete failed"); 
    }
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Movie Library</h2>
          <p className="text-gray-500 font-medium text-sm">Update catalog and monitor user ratings</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          + Create Movie
        </button>
      </header>

      {loading ? (
        <div className="py-24 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Syncing Catalog...</p>
        </div>
      ) : (
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {movies.map((m) => (
              <div key={m.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="relative h-64 rounded-2xl overflow-hidden mb-5 bg-gray-100">
                  <Image 
                    src={m.image || FALLBACK_IMAGE} 
                    alt={m.title} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    sizes="(max-width: 768px) 100vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-black shadow-xl flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" /> 
                    {m.avgRating ? parseFloat(m.avgRating).toFixed(1) : "0.0"}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-800 text-lg truncate mb-1">{m.title}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.15em] mb-4">
                    {m.MovieCategory?.category || "General"} • {m.year}
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => handleShowReviews(m)} 
                    className="w-full bg-gray-50 text-gray-600 py-3 rounded-xl text-xs font-black hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 border border-transparent"
                  >
                    <Eye size={16} /> REVIEWS ({m.reviewCount || 0})
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(m)} className="flex-1 p-3 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <Edit size={18} className="mx-auto" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="flex-1 p-3 border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <Trash2 size={18} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-6 mt-12 pb-10">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 rounded-2xl border border-gray-200 disabled:opacity-20 hover:bg-white shadow-sm active:scale-90"><ChevronLeft size={20} /></button>
              <span className="font-black text-sm text-gray-400 uppercase tracking-widest"><span className="text-blue-600">{currentPage}</span> / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 rounded-2xl border border-gray-200 disabled:opacity-20 hover:bg-white shadow-sm active:scale-90"><ChevronRight size={20} /></button>
            </nav>
          )}
        </main>
      )}

      {/* MODAL SECTION */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div key={selectedId || "new"} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{isEditing ? "Modify Movie" : "Add to Library"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 p-2"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative">
                  <Film className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Movie Title" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-800" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="col-span-2 relative">
                  <Feather className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Author" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-800" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Director" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-800" value={form.director} onChange={e => setForm({...form, director: e.target.value})} />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required type="number" placeholder="Year" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-800" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                </div>
                <div className="relative col-span-2">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required placeholder="Poster Image URL" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-800" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                </div>
                
                {/* CATEGORY SELECT - FIXED */}
                <div className="relative col-span-2">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none text-gray-800" 
                    value={form.category_id} 
                    onChange={e => setForm({...form, category_id: e.target.value})}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all mt-4">
                {isEditing ? "Save Changes" : "Confirm Entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL SECTION */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
             <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="font-black text-gray-800 text-lg uppercase tracking-tight truncate mr-4">Reviews: {selectedMovieTitle}</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
             </div>
             <div className="p-6 overflow-y-auto space-y-4 bg-gray-50/30">
                {selectedReviews.length > 0 ? selectedReviews.map(r => (
                  <article key={r.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm text-blue-600 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">{r.User?.name?.[0] || "U"}</div>
                        {r.User?.name || "Anonymous User"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-black bg-amber-50 px-2 py-1 rounded-lg"><Star size={12} className="fill-amber-500"/> {r.rating}</div>
                    </div>
                    <p className="text-gray-700 text-sm italic">&quot;{r.comment}&quot;</p>
                  </article>
                )) : (
                  <div className="text-center py-16">
                    <Star size={40} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium italic">No reviews yet.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}