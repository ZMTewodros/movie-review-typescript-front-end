"use client";
import React, { useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthProvider";

type Review = {
  id: number | string;
  rating: number;
  comment: string;
  user_id: number | string;
  User?: { name?: string };
};

export default function ReviewCard({
  review,
  onUpdated,
}: {
  review: Review;
  onUpdated: () => void;
}) {
  const { user } = useAuth();
  const isOwner = user?.id === review.user_id;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    rating: review.rating,
    comment: review.comment,
  });

  const handleSave = async () => {
    try {
      await api.put(`/reviews/${review.id}`, form);
      setEditing(false);
      onUpdated();
    } catch (err) {
      alert("Failed to update review");
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold uppercase border border-blue-200">
          {review.User?.name ? review.User.name.charAt(0) : "U"}
        </div>
        <div>
          <div className="font-bold text-gray-900 leading-tight">
            {review.User?.name || "Anonymous User"}
          </div>
          <div className="text-xs text-gray-400">Verified Reviewer</div>
        </div>
      </div>
      {editing ? (
        <div className="mt-2 bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Update Rating
          </label>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="border p-2 mb-3 rounded-md w-32"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} Stars
              </option>
            ))}
          </select>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Update Comment
          </label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="w-full border p-3 mb-3 rounded-md min-h-[80px]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 flex text-lg">
              {"★".repeat(review.rating)}
            </span>
            <span className="text-gray-200 flex text-lg">
              {"★".repeat(5 - review.rating)}
            </span>
          </div>
          <div className="text-gray-700 leading-relaxed mb-3">{review.comment}</div>
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
            >
              ✎ Edit Your Review
            </button>
          )}
        </>
      )}
    </div>
  );
}