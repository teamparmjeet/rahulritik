import React from 'react';
import Image from 'next/image';

export default function Box({ src, type }) {
    return (
        <div className="group w-full max-w-sm mx-auto hover:shadow-lg">
            <div className="relative h-36  bg-white w-full border sm:h-48 rounded-lg overflow-hidden shadow-lg">
                <Image
                    className="w-full h-full object-cover"
                    src={src}
                    height={192}
                    width={288}
                    alt={type}
                />
                <div className=' absolute top-0 left-0 bottom-0 right-0 flex justify-center items-end'>
                    <button className=' w-full bg-blue text-white px-4 py-2 '>Login</button>
                </div>
            </div>

        </div>
    );
}
