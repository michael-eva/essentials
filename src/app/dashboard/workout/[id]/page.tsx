'use client'
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkoutPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter()

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors pt-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div>Workout {id}</div>
    </div>
  )
}
