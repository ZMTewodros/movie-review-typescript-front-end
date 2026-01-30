"use client";
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import MovieCard from "../../components/MovieCard";

export default function Movies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const res = await api.get("/movies");
        setMovies(res.data.movies || []);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-bold animate-pulse text-lg">Loading movies...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}