import React from 'react'

export default function Btn1({ title }) {
    return (
        <>
            <button className='mx-2 bg-blue text-white px-2 lg:px-4 py-3 md:py-3 text-sm  duration-150 rounded-lg hover:bg-[#6cb049]'>
                {title}
            </button>

        </>
    )
}
