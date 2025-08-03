"use client";

import { Button } from "@app/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div 
      className="min-h-screen p-8 relative flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("https://lumoagentinloop.s3.us-east-1.amazonaws.com/lumo.png")'
      }}
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Dream Cloud Icon */}
        <div className="text-8xl mb-8">☁️</div>

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6 drop-shadow-xl">
          Lumo
        </h1>

        {/* Subtitle */}
        <p className="text-lg font-bold text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-xl">
          In this dream, you'll embark on a mystical journey through enchanted
          realms. Each choice you make will reveal a piece of your soul and
          guide you toward the perfect destination for your next adventure.
        </p>

        {/* CTA Button */}
        <div className="mb-8">
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/test/1">Begin Your Dream Journey →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
