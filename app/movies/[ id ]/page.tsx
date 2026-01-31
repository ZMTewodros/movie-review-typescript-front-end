"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import api from "../../services/api";
import ReviewCard from "../../components/ReviewCard";
import { useAuth } from "../../components/AuthProvider";
import { Star, ArrowLeft, Clapperboard, User, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AxiosError } from "axios";

// --- Types ---
interface ReviewUser { 
  name: string; 
}

interface Review {
  id: string | number;
  user_id: string | number;
  rating: number;
  comment: string;
  createdAt?: string;
  User?: ReviewUser;
}

interface Movie {
  id: string | number;
  title: string;
  image: string;
  director: string;
  author: string;
  MovieCategory?: { category: string };
  Reviews: Review[];
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export default function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap asynchronous params for Next.js 15
  const resolvedParams = use(params);
  const movieIdString = resolvedParams?.id;
  
  const { token, user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMovie = useCallback(async () => {
    const numericId = Number(movieIdString);
    if (!movieIdString || isNaN(numericId)) {
      setError("Invalid Movie ID format.");
      return;
    }

    try {
      const res = await api.get<Movie>(`/movies/${numericId}`);
      setMovie(res.data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.message || "Movie not found.");
    }
  }, [movieIdString]);

  useEffect(() => {
    if (movieIdString) fetchMovie();
  }, [fetchMovie, movieIdString]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (!activeToken) {
      setError("Authorization required. Please log in.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post(
        "/reviews",
        {
          rating: review.rating,
          comment: review.comment,
          movie_id: Number(movieIdString),
        },
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      setReview({ rating: 5, comment: "" });
      fetchMovie();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error || "Failed to post review.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasReviewed = movie?.Reviews?.some((rev: Review) => Number(rev.user_id) === Number(user?.id));

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-[40px] shadow-xl border border-gray-100 max-w-md">
          <p className="text-red-500 font-black text-2xl mb-4">Oops!</p>
          <p className="text-gray-600 font-medium mb-6">{error}</p>
          <Link href="/movies" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 block transition-all">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-400">Loading movie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 py-12">
      <Link href="/movies" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold transition-colors">
        <ArrowLeft size={20} /> Back to Library
      </Link>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16 bg-white p-2 rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="relative w-full lg:w-[400px] h-[550px] shrink-0">
          <Image 
            src={movie.image || "/placeholder-movie.jpg"} 
            alt={movie.title} 
            fill 
            className="object-cover rounded-[36px]" 
            priority 
          />
        </div>
        <div className="flex-1 py-8 pr-8 pl-4 lg:pl-0">
          <div className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-2xl font-black text-xs uppercase mb-6 tracking-widest shadow-lg shadow-blue-200">
            {movie.MovieCategory?.category || "Uncategorized"}
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-6 uppercase tracking-tighter leading-tight">{movie.title}</h1>
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600"><Clapperboard size={24} /></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Director</p><p className="text-xl font-bold text-gray-800">{movie.director}</p></div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-green-600"><User size={24} /></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Added By</p><p className="text-xl font-bold text-gray-800">{movie.author}</p></div>
             </div>
          </div>
        </div>
      </div>

      {/* Reviews Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 px-2">
        <div>
          <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={32} /> Reviews
          </h2>
          <p className="text-gray-500 font-medium">Hear what the cinephiles are saying</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm font-black text-blue-600">
          {movie.Reviews?.length || 0} FEEDBACKS
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {movie.Reviews?.length > 0 ? (
          movie.Reviews.map((r) => <ReviewCard key={r.id} review={r} onUpdated={fetchMovie} />)
        ) : (
          <div className="col-span-full py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-400 font-bold text-xl">Be the first to break the silence! 🎬</p>
          </div>
        )}
      </div>

      {/* Add Review Logic */}
      {token && !hasReviewed ? (
        <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-900/20">
          <h3 className="text-3xl font-black mb-2">Leave a Rating</h3>
          <p className="text-gray-400 mb-8 font-medium">Share your experience with the community.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-2xl w-fit">
              <span className="font-bold text-gray-400 mr-2">Your Score:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setReview({...review, rating: s})} className="transition-transform hover:scale-125 focus:outline-none">
                  <Star size={28} className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                </button>
              ))}
            </div>
            <textarea 
              value={review.comment} 
              onChange={(e) => setReview({...review, comment: e.target.value})} 
              className="w-full bg-gray-800/50 border border-gray-700 p-6 rounded-[24px] text-lg text-white outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]" 
              placeholder="Write your review here..." 
              required
            />
            <button disabled={submitting} className="group bg-blue-600 hover:bg-blue-50 text-white font-black py-5 px-10 rounded-[20px] transition-all flex items-center gap-3 shadow-xl shadow-blue-900/40 disabled:bg-gray-700">
              {submitting ? "Posting..." : "Post Review"} <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      ) : token && hasReviewed ? (
        <div className="p-10 bg-blue-50 rounded-[40px] text-center border-2 border-blue-100">
          <p className="text-2xl font-black text-blue-900">✨ Thanks for sharing your review!</p>
          <p className="text-blue-600/70 font-bold mt-2">You have already submitted your feedback for this movie.</p>
        </div>
      ) : (
        <div className="p-10 bg-gray-100 rounded-[40px] text-center border border-gray-200">
          <p className="text-gray-600 font-bold">Please log in to join the conversation and leave a review.</p>
        </div>
      )}
    </div>
  );
}