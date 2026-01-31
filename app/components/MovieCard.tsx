"use client";

import React from "react";
import Link from "next/link";
import { Star, User, Clapperboard, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MovieProps {
  movie: {
    id: string | number;
    title: string;
    image: string;
    director: string;
    author?: string;
    avgRating?: string | number;
    MovieCategory?: {
      category: string;
    };
  };
}

export default function MovieCard({ movie }: MovieProps) {
  const rating = movie.avgRating 
    ? parseFloat(movie.avgRating.toString()).toFixed(1) 
    : "0.0";

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-4 border border-gray-100 group flex flex-col h-full">
      
      {/* IMAGE CONTAINER */}
      <div className="relative mb-5 overflow-hidden rounded-2xl h-72 shadow-inner">
        <Image
          src={movie.image || "/placeholder-movie.jpg"} 
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* RATING BADGE */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/50 z-10">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="font-black text-sm text-gray-900">{rating}</span>
        </div>

        {/* CATEGORY OVERLAY */}
        {movie.MovieCategory?.category && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-lg">
              {movie.MovieCategory.category}
            </span>
          </div>
        )}
      </div>

      {/* MOVIE INFO */}
      <div className="px-1 flex-1 flex flex-col">
        <h3 className="font-black text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors truncate">
          {movie.title}
        </h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Clapperboard size={14} className="text-blue-500" />
            <p className="text-sm font-medium">
              <span className="text-gray-400">Dir:</span> {movie.director}
            </p>
          </div>
          
          {movie.author && (
            <div className="flex items-center gap-2 text-gray-500">
              <User size={14} className="text-green-500" />
              <p className="text-sm font-medium line-clamp-1">
                <span className="text-gray-400">By:</span> {movie.author}
              </p>
            </div>
          )}
        </div>

        <Link
          href={`/movies/${movie.id}`}
          className="mt-auto w-full bg-gray-900 group-hover:bg-blue-600 text-white font-bold py-4 rounded-2xl text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 group-hover:shadow-blue-200"
        >
          View Details
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}