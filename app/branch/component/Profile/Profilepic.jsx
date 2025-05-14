"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

export default function Profilepic() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const profileMenuRef = useRef(null);

    const openbox = () => {
        setOpen(!open);
    };

    const getFirstLetter = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'T';
    };

    // Close the menu if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setOpen(false); // Close the menu
            }
        };

        // Add event listener to document
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div
                onClick={openbox}
                className="cursor-pointer border rounded-full h-10 w-10 flex justify-center items-center overflow-hidden"
            >
                <div className="bg-[#6cb049] text-white flex font-bold items-center justify-center h-10 w-10 rounded-full">
                    {getFirstLetter(session?.user?.name || 'T')}
                </div>
            </div>

            {open && (
                <div
                    ref={profileMenuRef}
                    className="absolute right-5 mt-2 w-64 rounded-md shadow-sm border bg-white z-50"
                >
                    <div className="flex flex-col gap-3 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/image/profile/tifaindia_logo.webp"
                                    className="rounded-full"
                                    width={60}
                                    height={60}
                                    alt="Profile"
                                />
                            </div>
                            <div>
                                <div className="text-lg font-semibold">
                                    {session?.user?.name || 'Guest User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {session?.user.email?.length > 20
                                        ? `${session.user.email.slice(0, 20)}...`
                                        : session.user.email}
                                </div>
                            </div>
                        </div>

                        <div className="border-t mt-3 pt-3">
                            <Link
                                href="/branch/page/profile"
                                onClick={() => {
                                    setOpen(!open);
                                }}
                            >
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <span className="text-gray-700 font-medium">Profile</span>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                <Settings className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700 font-medium">Settings</span>
                            </div>
                            <div
                                onClick={() => {
                                    signOut();
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                                <LogOut className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700 font-medium">Logout</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
