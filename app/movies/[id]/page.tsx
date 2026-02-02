"use client";

import React, { useEffect, useState, useCallback, use } from "react"; // <-- import use()
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {  MessageSquare, ArrowLeft } from "lucide-react";
import api from "../../services/api"; 
import { useAuth } from "../../components/AuthProvider"; 
import ReviewCard from "../../components/ReviewCard"; 
import { AxiosError } from "axios";

// --- TYPES ---
interface User {
  id: number;
  name: string;
} 


interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string;
  userId: number;
  movieId: number;
  User?: User;
}

interface Movie {
  id: number;
  title: string;
  director: string;
  author: string;
  year: number;
  image: string;
  avgRating: number;
  reviews: Review[];
}

// --- Component ---
export default function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the promise using use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const { token, user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- check if user already reviewed ---
  const hasReviewed = movie?.reviews?.some((rev) => 
    Number(rev.userId) === Number(user?.id) || Number(rev.User?.id) === Number(user?.id)
  );

  // --- fetch movie details ---
  const fetchMovieDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get<Movie>(`/movies/${id}`);
      const normalizedReviews = res.data.reviews.map(r => ({
        ...r,
        userId: r.userId ?? 0,
        movieId: r.movieId ?? 0,
      }));
      setMovie({
        ...res.data,
        reviews: normalizedReviews,
        avgRating: res.data.avgRating ?? 0, // default 0 if null
      });
    } catch (err) {
      console.error("Fetch Error:", err);
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchMovieDetails(); }, [fetchMovieDetails, refresh]);

  // --- submit new review ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { router.push("/login"); return; }

    setSubmitting(true);
    try {
      await api.post("/reviews", {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        movie_id: Number(id),
        user_id: user?.id,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setReviewForm({ rating: 5, comment: "" });
      setRefresh(prev => !prev);
    } catch (err) {
      alert(err instanceof AxiosError ? err.response?.data?.message : "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-500 italic">Loading details...</div>;
  if (!movie) return <div className="p-20 text-center text-red-500 font-bold">Movie not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-white">
      <Link href="/movies" className="inline-flex items-center gap-2 mb-8 text-blue-600 font-bold hover:underline">
        <ArrowLeft size={20} /> Back to Library
      </Link>

      <div className="flex flex-col md:flex-row gap-12 bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
        <div className="relative w-full md:w-96 h-[540px] shrink-0">
          <Image src={movie.image || "/placeholder.jpg"} alt={movie.title} fill className="rounded-[2rem] object-cover shadow-2xl" priority />
        </div>
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight">{movie.title}</h1>
          <p className="text-gray-600 text-lg mb-4"><span className="font-bold">Director:</span> {movie.director}</p>
          <p className="text-gray-600 text-lg mb-8"><span className="font-bold">Year:</span> {movie.year}</p>
                    <p className="text-gray-600 text-lg mb-4"><span className="font-bold">author:</span> {movie.author}</p>

          {/* <div className="bg-gray-900 text-white px-10 py-5 rounded-3xl flex items-center gap-4 w-fit shadow-xl">
            <Star className="text-yellow-400 fill-yellow-400" size={32} /> 
            <span className="text-4xl font-black">{(movie.avgRating ?? 0).toFixed(1)}</span>
          </div> */}
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h3 className="text-3xl font-black text-gray-900 mb-10">User Reviews</h3>
          <div className="space-y-6">
            {movie.reviews.length > 0 
              ? movie.reviews.map(rev => <ReviewCard key={rev.id} review={rev} onUpdated={() => setRefresh(prev => !prev)} />)
              : <p className="text-gray-400 italic">No reviews yet.</p>
            }
          </div>
          {hasReviewed && (
            <div className="mt-12 p-8 bg-blue-50 border border-blue-100 rounded-[2rem] text-center">
              <h4 className="text-blue-900 font-black text-xl mb-2">You already reviewed this movie!</h4>
              <p className="text-blue-700">You can edit or delete your submission above.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl sticky top-8">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <MessageSquare className="text-blue-600" /> Write Review
            </h3>
            {!hasReviewed ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <select value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})} className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 min-h-[150px] outline-none" placeholder="Your thoughts..." required />
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl disabled:bg-gray-300">
                  {submitting ? "Posting..." : "Post Review"}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500 font-bold">
                Review submitted.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
