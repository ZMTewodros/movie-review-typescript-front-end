"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import api from "../services/api";
import MovieCard from "../components/MovieCard";
import { 
  Search, Film, Filter, 
  RefreshCcw, ChevronsLeft, ChevronsRight 
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Define interfaces to fix "any" errors
interface Category {
  id: string | number;
  category: string;
}

interface Movie {
  id: string | number;
  title: string;
  image: string;
  director: string;
  author?: string;
  avgRating?: string | number;
  MovieCategory?: {
    category: string;
  };
}

function MoviesList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Local state for the input field
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  // URL-derived values
  const currentPage = Number(searchParams.get("page")) || 1;
  const selectedCategory = searchParams.get("category") || "";
  const activeSearch = searchParams.get("search") || "";

  // 1. Update URL Params Helper (wrapped in useCallback to prevent re-renders)
  const updateQueryParams = useCallback((newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    // Only push if the string actually changed to prevent infinite loops
    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (newQuery !== currentQuery) {
      router.push(`${pathname}?${newQuery}`);
    }
  }, [searchParams, pathname, router]);

  // 2. Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput !== activeSearch) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, activeSearch, updateQueryParams]);

  // 3. Fetch Movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/movies`, {
          params: {
            page: currentPage,
            limit: 8, 
            category_id: selectedCategory || undefined,
            search: activeSearch || undefined 
          }
        });
        setMovies(res.data.movies || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Movie Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedCategory, activeSearch]);

  // 4. Fetch Categories
  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data || []));
  }, []);

  const handleReset = () => {
    setSearchInput("");
    router.push(pathname); 
  };

  const handleJump = (amount: number) => {
    let newPage = currentPage + amount;
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    updateQueryParams({ page: newPage });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <div className="bg-white border-b py-10 px-4 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Film className="text-blue-600" /> Explore Movies
          </h1>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title or director..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="relative w-full md:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-gray-700 cursor-pointer shadow-sm"
                value={selectedCategory}
                onChange={(e) => updateQueryParams({ category: e.target.value, page: 1 })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category}</option>
                ))}
              </select>
            </div>
            
            {(activeSearch || selectedCategory) && (
              <button 
                onClick={handleReset} 
                className="p-3.5 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors text-red-600 flex items-center gap-2 font-bold"
              >
                <RefreshCcw size={18} />
                <span className="md:hidden lg:inline text-xs">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> 
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 md:gap-4">
                  <button 
                    onClick={() => handleJump(-5)}
                    disabled={currentPage <= 1}
                    className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-50 disabled:opacity-30 shadow-sm"
                  >
                    <ChevronsLeft size={20} />
                  </button>

                  <button 
                    disabled={currentPage === 1}
                    onClick={() => updateQueryParams({ page: currentPage - 1 })}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-blue-700 transition-all shadow-md"
                  >
                    Prev
                  </button>

                  <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-700">
                    {currentPage} / {totalPages}
                  </div>

                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => updateQueryParams({ page: currentPage + 1 })}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-blue-700 transition-all shadow-md"
                  >
                    Next
                  </button>

                  <button 
                    onClick={() => handleJump(5)}
                    disabled={currentPage >= totalPages}
                    className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-50 disabled:opacity-30 shadow-sm"
                  >
                    <ChevronsRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl font-medium">No movies found matching your criteria.</p>
            <button onClick={handleReset} className="mt-4 text-blue-600 font-bold hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure the outer component stays clean
export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading Explore Section...</div>}>
      <MoviesList />
    </Suspense>
  );
}