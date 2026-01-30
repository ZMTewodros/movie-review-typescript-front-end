import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

type Movie = {
  id: number | string;
  title: string;
  image: string;
  director?: string;
  author?: string;
  avgRating?: string | number;
  MovieCategory?: { category: string };
};

export default function MovieCard({ movie }: { movie: Movie }) {
  const rating = movie.avgRating ? parseFloat(movie.avgRating as string).toFixed(1) : "0.0";

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col border border-gray-100 group">
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={movie.image}
          alt={movie.title}
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1 border border-gray-100 z-10">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-xs text-gray-800">{rating}</span>
        </div>
      </div>
      <h2 className="font-bold text-lg mb-1 text-gray-900 truncate">{movie.title}</h2>
      <div className="space-y-0.5 text-sm mb-4">
        <p className="text-gray-600">
          <span className="font-semibold">Director:</span> {movie.director}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Author:</span> {movie.author}
        </p>
        <p className="text-blue-600 font-medium text-xs bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
          {movie.MovieCategory?.category}
        </p>
      </div>
      <Link
        href={`/movies/${movie.id}`}
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center transition-colors text-sm"
      >
        View Details
      </Link>
    </div>
  );
}