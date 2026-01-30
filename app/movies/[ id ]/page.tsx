"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../services/api";
import ReviewCard from "../../../components/ReviewCard";
import { useAuth } from "../../../components/AuthProvider";

export default function MovieDetails() {
  const params = useParams();
  const id = params?.id;
  const { token, user } = useAuth();
  const [movie, setMovie] = useState<any>(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    api.get(`/movies/${id}`).then((res) => setMovie(res.data));
  }, [id, refresh]);

  const hasReviewed = movie?.Reviews?.some((rev: any) => rev.user_id === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/reviews", { ...review, movie_id: id });
      setReview({ rating: 5, comment: "" });
      setRefresh(r => !r);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to submit review");
    }
  };

  if (!movie) return <div className="p-8 text-center">Loading movie details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ...Movie info, reviews, and form as in your old code... */}
    </div>
  );
}