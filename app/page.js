import React from 'react';
import Box from '@/components/box/Box';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-screen">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("/image/background/bg-pattern.png")' }}></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-8">
          <h1 className="text-3xl mb-5 sm:mb-0 sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-wide drop-shadow-md animate-fade-in-up">
            Welcome to Tifa Portal
          </h1>
          <p className="text-base hidden md:block text-gray-700 mt-4 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Your one-stop platform for managing staff, branch, and Tiffa access. Select your login option below.
          </p>

          <div className="grid lg:grid-cols-3 grid-cols-2 gap-8 w-full max-w-6xl px-4 md:px-12 lg:px-24">
            <div className=" lg:col-span-1 col-span-1">
              <Link href="/signin">
                <Box src="/image/profile/communication-flat-icon_1262-18771.avif" type="Staff Login" />
              </Link>
            </div>

            <div className=" lg:col-span-1 col-span-1">
              <Link href="/signin">
                <Box src="/image/profile/brancoffice.png" type="Branch Login" />
              </Link>
            </div>

            <div className=" lg:col-span-1 col-span-2">
              <Link href="/signin">
                <Box src="/image/profile/luxury-working-room-executive-office_105762-1725.avif" type="Tifa" />
              </Link>
            </div>
          </div>

         
        </div>
      </div>
    </>
  );
}
