import React from 'react'
import CoursesCategory from '../../component/Courses/CoursesCategory'
import Course from '../../component/Courses/Course'
import AllCourses from '../../component/Courses/AllCourses'
export default function page() {
    return (
        <>
            <div className=' grid lg:grid-cols-3 h-svh bg-gray-100  p-4 gap-4'>
                <div className="lg:col-span-2">
                    <AllCourses/>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <Course />
                    <CoursesCategory />
                </div>



            </div>
        </>
    )
}
