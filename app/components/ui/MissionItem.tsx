'use client';

import Link from 'next/link';

interface MissionItemProps {
  id: string;
  status: 'completed' | 'ongoing' | 'locked';
}

export default function MissionItem({ id, status }: MissionItemProps) {
  const displayId = id.replace('m', 'M').toUpperCase();

  const baseClasses = "w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 relative";

  const statusClasses = {
    completed: "bg-success-light border-2 border-success text-success",
    ongoing: "bg-blue-50 border-2 border-primary text-primary shadow-lg cursor-pointer hover:scale-105",
    locked: "bg-gray-50 border-2 border-gray-200 text-gray-300",
  };

  const content = (
    <div className={`${baseClasses} ${statusClasses[status]}`}>
      {status === 'completed' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-success rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {status === 'ongoing' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {status === 'locked' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {displayId}
    </div>
  );

  if (status === 'ongoing') {
    return (
      <Link href={`/missions/${id}`}>
        {content}
      </Link>
    );
  }

  return content;
}