import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 animate-pulse h-full">
      <div className="aspect-square bg-gray-200" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-4 bg-gray-200 rounded-full w-1/2" />
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-10 bg-gray-200 rounded-2xl w-24" />
        </div>
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return <div className="h-48 md:h-[400px] bg-gray-200 rounded-[2rem] animate-pulse" />;
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-[2rem]" />
      <div className="h-3 bg-gray-200 rounded-full w-16" />
    </div>
  );
}
