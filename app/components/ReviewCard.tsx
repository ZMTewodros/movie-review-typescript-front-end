"use client";

import React, { useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthProvider";
import { Star, Edit3, X, Check, Loader2 } from "lucide-react";

interface ReviewProps {
  review: {
    id: string | number;
    user_id: string | number;
    rating: number;
    comment: string;
    createdAt?: string;
    User?: {
      name: string;
    };
  };
  onUpdated: () => void;
}

export default function ReviewCard({ review, onUpdated }: ReviewProps) {
  const { user } = useAuth();
  const isOwner = user?.id === review.user_id;
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: review.rating, comment: review.comment });

  const handleSave = async () => {
    if (!form.comment.trim()) return;
    setLoading(true);
    try {
      await api.put(`/reviews/${review.id}`, form);
      setEditing(false);
      onUpdated();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Failed to update review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* HEADER: USER INFO & ACTION */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-100">
            {review.User?.name?.[0] || "U"}
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
          <button 
            onClick={() => setEditing(true)} 
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Edit3 size={18} />
          </button>
        )}
      </div>

      {/* RATING DISPLAY / SELECTOR */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!editing}
            onClick={() => setForm({ ...form, rating: star })}
            className={`${editing ? "cursor-pointer scale-110 hover:scale-125" : "cursor-default"} transition-transform`}
          >
            <Star 
              size={18} 
              className={star <= (editing ? form.rating : review.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
            />
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      {editing ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <textarea 
            className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700 min-h-[100px] resize-none"
            placeholder="Share your thoughts about the movie..."
            value={form.comment} 
            onChange={e => setForm({...form, comment: e.target.value})}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Save Changes
            </button>
            <button 
              onClick={() => { setEditing(false); setForm({ rating: review.rating, comment: review.comment }); }} 
              disabled={loading}
              className="bg-gray-100 text-gray-500 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <span className="absolute -left-2 -top-2 text-4xl text-blue-100 font-serif leading-none">“</span>
          <p className="text-gray-600 leading-relaxed font-medium pl-4">
            {review.comment}
          </p>
        </div>
      )}
    </div>
  );
}