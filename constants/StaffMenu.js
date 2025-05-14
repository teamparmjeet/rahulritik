import {
    UserPlus,
    User,
    CheckSquare,
    ListCollapse

} from 'lucide-react';

export const Menulist = [
    {
        id: "1",
        title: "Admission",
        icon: CheckSquare,
        submenu: [

            { name: "Enrolled Students", icon: CheckSquare, href: "/staff/page/enroll" },
            { name: "Our Demo Count", icon: ListCollapse, href: "/staff/page/demo" },
            { name: "New Admissions", icon: UserPlus, href: "/staff/page/addquery" }

        ],
    },

    // {
    //     id: "2",
    //     title: "Communication",
    //     icon: Mail,
    //     submenu: [
    //         { name: "Email Communication", icon: Mail,href:"/staff/underdevelopment" },
    //     ],
    // },
];
