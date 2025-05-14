import {
    UserPlus,
    User,
    CheckSquare,
    Book,
    Calendar,
    MessageSquare,
    Users,
    AlertTriangle,
    FileText,
    Phone,
    MapPinHouse,
    MapPinPlus,
    ShieldCheck,
    Download,
    Mail,
    Gauge,
    ListCollapse

} from 'lucide-react';

export const Menulist = [
    {
        id: "1",
        title: "Admission",
        icon: CheckSquare,
        submenu: [
            { name: "New Admissions", icon: UserPlus, href: "/branch/page/addquery" },
            { name: "Our Demo Count", icon: ListCollapse, href: "/branch/page/demo" },
            { name: "Enrolled Students", icon: CheckSquare, href: "/branch/page/enroll" }

        ],
    },
    {
        id: "2",
        title: "Branches",
        icon: MapPinHouse,
        submenu: [
            { name: "Register Staff", icon: ShieldCheck, href: "/branch/page/registerstaff" },
            { name: "Staff", icon: Users, href: "/branch/page/staff" },
            { name: "Branch Reports", icon: Download, href: "/branch/page/report" },
        ],
    },
    // {
    //     id: "5",
    //     title: "Communication",
    //     icon: Mail,
    //     submenu: [
    //         { name: "Email Communication", icon: Mail,href:"/branch/underdevelopment" },
    //     ],
    // },
];
