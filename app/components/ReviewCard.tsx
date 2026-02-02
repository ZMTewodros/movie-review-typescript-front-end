"use client";

import React, { useState } from "react";
import api from "../services/api";
import { useAuth } from "../components/AuthProvider";
import { Star, Edit3, X, Check, Loader2, Trash2 } from "lucide-react";
import { AxiosError } from "axios";

interface ReviewProps {
  review: {
    id: number;
    userId: number;
    movieId: number;
    rating: number;
    comment: string;
    createdAt?: string;
    User?: { name: string; id: number };
  };
  onUpdated: () => void;
}

export default function ReviewCard({ review, onUpdated }: ReviewProps) {
  const { user, token } = useAuth();
  
  // Use Number() to ensure both are treated as numbers during comparison
  const isOwner = user?.id && review.userId && Number(user.id) === Number(review.userId);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: review.rating,
    comment: review.comment,
  });

  const handleSave = async () => {
    if (!token) return alert("Session expired. Please login again.");
    if (!form.comment.trim()) return alert("Comment cannot be empty.");

    setLoading(true);
    try {
      await api.put(
        `/reviews/${review.id}`, 
        {
          rating: Number(form.rating),
          comment: form.comment.trim(),
          userId: user?.id, // Explicitly send userId for ownership check
          movieId: Number(review.movieId)
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditing(false);
      onUpdated(); 
    } catch (err) {
      console.error("Update Error:", err);
      const message = err instanceof AxiosError 
        ? err.response?.data?.message || "Internal Server Error" 
        : "Error updating";
      alert(`Backend Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !user) return;
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    setLoading(true);
    try {
      // For DELETE requests, we send userId in the data object for axios
      await api.delete(`/reviews/${review.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: user?.id } 
      });
      onUpdated();
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete review. Check if this review belongs to you.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg text-xl">
            {review.User?.name ? review.User.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <p className="font-black text-gray-900 leading-tight">
              {review.User?.name || "Anonymous User"}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
            </p>
          </div>
        </div>

        {isOwner && !editing && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Edit3 size={18} />
            </button>
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editing}
            onClick={() => setForm({ ...form, rating: star })}
            className={editing ? "cursor-pointer scale-110" : "cursor-default"}
          >
            <Star 
              size={18} 
              className={star <= (editing ? form.rating : review.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
            />
          </button>
        ))}
      </div>

      {editing ? (
        <div className="space-y-4">
          <textarea 
            className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-blue-600 outline-none min-h-[100px] resize-none"
            value={form.comment} 
            onChange={e => setForm({...form, comment: e.target.value})}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Save
            </button>
            <button 
              onClick={() => { setEditing(false); setForm({ rating: review.rating, comment: review.comment }); }} 
              className="bg-gray-100 text-gray-500 px-4 py-3 rounded-xl font-bold"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 leading-relaxed font-medium">
          {review.comment}
        </p>
      )}
    </div>
  );
}