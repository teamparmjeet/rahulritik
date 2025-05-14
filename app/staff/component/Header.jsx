"use client"
import React, { useState, useEffect } from 'react';
import { Settings, Bell, Menu, Search } from "lucide-react";
import Btn1 from '@/components/Button/Btn1';
import Profilepic from './Profile/Profilepic';
import Smallbtn from '@/components/Button/Smallbtn';
import Image from 'next/image';
import { Menulist } from '@/constants/StaffMenu';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export default function Header() {
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [isLgScreen, setIsLgScreen] = useState(false);
    const [count, setCount] = useState("");
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false); // State to control alert visibility
    const { data: session } = useSession();
    const [adminId, setAdminId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [queriesnotification, setQueriesnotification] = useState([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            if (session?.user?.email) {
                try {
                    const { data } = await axios.get(`/api/admin/find-admin-byemail/${session.user.email}`);
                    setAdminId(data._id);
                } catch (error) {
                    console.error(error.message);
                }
            }
        };
        fetchAdminData();
    }, [session]);

    // Fetch query data every 1 minute and manage alert visibility
    useEffect(() => {
        const fetchQueryData = async () => {
            if (adminId) {
                try {
                    const { data } = await axios.get(`/api/alert/${adminId}`);
                    setCount(data.count);

                    if (data.count > 0) {
                        setShowAlert(true);  // Show the alert
                        setTimeout(() => setShowAlert(false), 10000); // Hide the alert after 10 seconds
                    }
                } catch (error) {
                    console.error('Error fetching query data:', error);
                }
            }
        };

        fetchQueryData(); // Initial fetch

        const intervalId = setInterval(fetchQueryData, 60000); // Fetch every 60 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [adminId]);

    useEffect(() => {
        const fetchQueryData = async () => {
            if (adminId) {
                try {
                    setLoading(true);
                    const { data } = await axios.get(`/api/queries/assignedreq/${adminId}?autoclosed=open`);
                    const filteredQueries = data.fetch.filter(query => query.assignedTostatus);
                    setQueriesnotification(filteredQueries);
                } catch (error) {
                    console.error('Error fetching query data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
    
        fetchQueryData(); // Initial fetch
    
        const intervalId = setInterval(fetchQueryData, 60000); // Fetch every 60 seconds
    
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [adminId]);
    

    useEffect(() => {
        const handleResize = () => {
            setIsLgScreen(window.innerWidth >= 1278);
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseEnter = (id) => {
        if (isLgScreen) setOpenSubmenu(id);
    };

    const handleMouseLeave = () => {
        if (isLgScreen) setOpenSubmenu(null);
    };

    const handleClick = (id) => {
        if (!isLgScreen) {
            setOpenSubmenu(openSubmenu === id ? null : id);
        }
    };

    const toggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    return (
        <div className='shadow lg:h-[70px] lg:flex items-center'>
            <div className="lg:w-[97%] px-2 mx-auto">
                <div className="grid lg:grid-cols-9 sm:grid-cols-2 grid-cols-2 items-center">
                    <div className="lg:col-span-6 sm:col-span-1 col-span-1">
                        <div className='flex items-center justify-start gap-5'>
                            <button className='opacity-0'>
                                <Menu />
                            </button>
                            <div className='grid lg:grid-cols-12 items-center'>
                                <div className='col-span-2'>
                                    <Image src="/image/profile/tifaindia_logo.webp" alt='Logo' width={133.25} height={70.5} />
                                </div>

                                <div className='col-span-10 hidden xl:flex items-center'>
                                    <ul className='flex flex-wrap'>
                                        {Menulist.map((item) => (
                                            <li
                                                key={item.id}
                                                className='relative group'
                                                onMouseEnter={() => handleMouseEnter(item.id)}
                                                onMouseLeave={handleMouseLeave}
                                                onClick={() => handleClick(item.id)}
                                            >
                                                <div className='cursor-pointer hover:bg-gray-100 text-[14px] text-gray-700 rounded-md px-4 py-2 duration-150'>
                                                    {item.title}
                                                </div>
                                                {(openSubmenu === item.id && item.submenu) && (
                                                    <ul className='absolute lg:w-80 top-100 left-0 bg-white shadow p-2 rounded-lg z-50'>
                                                        {item.submenu.map((submenuItem, index) => (
                                                            <Link key={index} href={submenuItem.href}>
                                                                <li className='py-2 px-3 hover:bg-[#6cb049] flex items-center gap-x-2 text-sm text-gray-700 hover:text-white duration-150 cursor-pointer rounded-md'>
                                                                    <submenuItem.icon size={17} /> {submenuItem.name}
                                                                </li>
                                                            </Link>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                        <Link href="/staff/page/today">
                                            <li
                                                className='cursor-pointer hover:bg-gray-100 text-[14px] text-gray-700 rounded-md px-4 py-2 duration-150'>
                                                Today Follow Up
                                            </li>
                                        </Link>


                                        <Link href="/staff/page/demo">
                                            <li
                                                className='cursor-pointer hover:bg-gray-100 text-[14px] text-gray-700 rounded-md px-4 py-2 duration-150'>
                                                Demo
                                            </li>
                                        </Link>
                                    </ul>
                                    {queriesnotification.length > 0 && (
                                        <span className="bg-red-600 text-black font-bold rounded-full px-4 py-1 text-sm shadow-lg relative inline-flex items-center animated-border">
                                            <span className='mr-2 bg-white text-red-600 p-1 rounded-full'> {queriesnotification.length}</span>
                                            Assigned Request
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 sm:col-span-1 col-span-1">
                        <div className='flex items-center justify-end gap-1 lg:gap-1'>

                            {showAlert && count > 0 && (
                                <div className="bg-yellow-400 text-black font-bold rounded-full px-4 py-2 text-sm shadow-lg relative inline-flex items-center animated-border">
                                    <span className="absolute -top-1 -right-1 bg-red-800 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                                        {count}
                                    </span>
                                    Urgent Attention Required!
                                </div>
                            )}


                            <div className='sm:block hidden'>
                                <Smallbtn icon={Settings} href="/staff/page/profile" />
                            </div>
                            <div onClick={toggleNotification}>
                                <Smallbtn icon={Bell} href="javascript:void(0)" />
                            </div>
                            {isNotificationOpen && (
                                <div className="absolute top-16 right-4 w-[300px] bg-white rounded-md shadow-sm border p-4 z-50 h-[70vh] overflow-y-auto">
                                    <h4 className="text-lg font-semibold mb-2">Notifications</h4>
                                    <ul className="space-y-2">
                                        <li className="text-gray-700">No new notifications</li>
                                    </ul>
                                </div>
                            )}
                            <div className='sm:block hidden'>
                                <Link href="/staff/page/addquery">
                                    <Btn1 title="New Query" />
                                </Link>
                            </div>
                            <div><Profilepic /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
