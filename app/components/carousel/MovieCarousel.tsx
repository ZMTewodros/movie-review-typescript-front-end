"use client";

import React from "react";
import { Carousel } from "react-responsive-carousel";
import Footer from "../Footer";
import { img } from "../../data/data";
import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css";


export default function MovieCarousel() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div>
          <h1 className="text-4xl md:text-6xl text-gray-900 pt-8 text-center font-bold">
            Welcome to this Movie Review Platform
          </h1>
          <p className="mt-4 text-lg text-center text-gray-700">
            Explore movies, submit reviews, and evaluate ratings.
          </p>
        </div>

        <div className="max-w-7xl mx-auto mt-6 px-4">
          <Carousel
            autoPlay
            infiniteLoop
            showIndicators={false}
            showThumbs={false}
            showStatus={false}
            interval={2000}
          >
            {img.map((imageItemLink, index) => (
              <div key={index} className="relative h-96">
               <Image
  src={imageItemLink}
  alt="movie"
  fill
  className="object-cover rounded shadow-lg"
/>
 
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded">
                  <div className="text-center text-white px-8">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4">
                      Log in to explore and share your opinions.
                    </h2>
                    <p className="text-lg opacity-80 mt-10">
                      Built with React, Node.js & PostgreSQL
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </main>
      <Footer />
    </div>
  );
}