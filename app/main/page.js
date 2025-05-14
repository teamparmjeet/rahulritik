"use client"
import React from 'react';
import Mainline from "@/components/Graph/MainLine"
import MainBar from "@/components/Graph/MainBar"
import MainPie from "@/components/Graph/MainPie"
export default function Page() {

  return (
    <div className=" mx-auto p-6  rounded-lg bg-blue-50">

      <div className="grid gap-6 md:grid-cols-2 grid-cols-1 ">


        <div className=' md:col-span-2'>
          <Mainline />
        </div>


        <MainBar />

        <MainPie />




      </div>
    </div>
  );
}
