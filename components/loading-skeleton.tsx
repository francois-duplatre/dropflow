'use client';

import { Card, CardContent } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type: 'shops' | 'products';
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === 'shops') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-white/60 backdrop-blur-sm border-slate-200 animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-slate-300"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-300 rounded w-24"></div>
                    <div className="h-3 bg-slate-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-8 h-8 bg-slate-300 rounded"></div>
                  <div className="w-8 h-8 bg-slate-300 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-300 rounded w-20"></div>
                <div className="h-10 bg-slate-300 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'products') {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-300 rounded w-48"></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {[...Array(8)].map((_, index) => (
                  <th key={index} className="h-10 bg-slate-300 rounded"></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(8)].map((_, colIndex) => (
                    <td key={colIndex} className="h-12 bg-slate-300 rounded"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
} 