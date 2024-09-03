import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "MAFTOUH OMAR",
  initials: "DV",
  url: "https://dillion.io",
  location: "San Francisco, CA",
  locationLink: "https://www.google.com/maps/place/sanfrancisco",
  description:
    "Full-stack Developer | Data Science Student Front/Back-End, UI/UX Enthusiast | Problem Solver Crafting Web Dreams!",
  summary:
    "Junior Full Stack Developer and Data Science student, passionate about building complete web solutions. With a keen interest in application security and a solid background in Digital Development. I also have experience with WordPress and a strong desire to learn and evolve in the field of Data Science.",
  avatarUrl: "/me.png",
  skills: [
    "Js",
    "React",
    "Redux",
    "Next.js",
    "Vite.js",
    "NodeJS",
    "Express",
    "Php",
    "Laravel",
    "Mongodb",
    "Css",
    "Bootstrap",
    "Tailwind",
    "Jira",
    "Git",
    "Figma",
    "...",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "m.omarmaftouh@gmail.com",
    tel: "0604534791",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/MAFTOUH-Omar",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/omar-maftouh-71212722a/",
        icon: Icons.linkedin,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:m.omarmaftouh@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "NovaCode",
      href: "",
      badges: [],
      location: "Full time",
      title: "Full-stack Developer",
      logoUrl: "/novacode.jpg",
      start: "Mai 2024",
      end: "Today",
      description:
        "As a Full Stack Developer in a development company, I am in charge of back-end development using Laravel and front-end development with technologies such as React, Inertia, and Next.js. In addition to creating modern and performant user interfaces, I also take care of server configuration to ensure a solid and secure infrastructure. Furthermore, I have developed an artificial intelligence model capable of detecting spam, thus helping to improve the security and efficiency of the applications I build.",
    },
    {
      company: "Freelance",
      badges: [],
      href: "",
      location: "Remote",
      title: "Full-stack Developer",
      logoUrl: "/upwork.svg",
      start: "Oct 2024",
      end: "Today",
      description:
        "Freelancer Full Stack Developer specialized in the development of custom web solutions. I offer complete services, including development, configuration, deployment, and server maintenance. My commitment: to create high-performance and reliable solutions, with continuous technical support to guarantee the stability and efficiency of your projects.",
    },
  ],
  education: [
    {
      school: "UNIVERSITE SULTAN MOULAY SLIMANE FACULTE",
      href: "https://www.fpbm.ma/new/",
      degree: "Bachelor of Excellence, Data Science and Information Systems Security",
      logoUrl: "/images.jpg",
      start: "2023",
      end: "2024",
    },
    {
      school: "ISGI Khouribga",
      href: "",
      degree: "Technician specialized in full stack development",
      logoUrl: "/OFPPT.png",
      start: "2021",
      end: "2023",
    },
    {
      school: "TECH 57",
      href: "",
      degree: "Website development with wordpress certificate",
      logoUrl: "/tech57.jpg",
      start: "2023",
      end: "2023",
    },
  ],
  projects: [
    {
      title: "Store IPTV",
      href: "/Store.png",
      dates: "Oct 2023 - Oct 2024",
      active: true,
      description:
        "A full-stack MERN project designed to create a dynamic web application, integrating MongoDB, Express, React, and Node.js. The project features seamless front-end and back-end communication, user authentication, and real-time data processing for an enhanced user experience.",
      technologies: [
        "React",
        "Node",
        "Express",
        "Mongodb",
        "TailwindCSS",
        "Redux",
        "Stripe",
        "Paypal",
        "Coinbase",
        "...",
      ],
      links: [
        {
          type: "Website",
          href: "https://store.thesmartiptv.com/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/Store.png",
    },
    {
      title: "MCIE",
      href: "https://mcie-client-dmtv.vercel.app/",
      dates: "Aug 2024 - Sep 2024",
      active: true,
      description:
        "An independent, non-profit center, founded in 2019, by researchers in economic and financial participatory transactions in Morocco.",
      technologies: [
        "React",
        "Node",
        "Express",
        "Mongodb",
        "TailwindCSS",
        "Context",
        "aceternity ui",
      ],
      links: [
        {
          type: "Website",
          href: "https://mcie-client-dmtv.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/MAFTOUH-Omar/MCIE_CLIENT",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/Mcie.png",
    },
    {
      title: "RebornOTT",
      href: "https://llm.report",
      dates: "June 2024 - September 2024",
      active: true,
      description:
        "A custom dashboard built using the Quickframe template, featuring seamless API integration for real-time data visualization and management. The project offers an intuitive interface for monitoring and analyzing key metrics efficiently.",
      technologies: [
        "Vite.js",
        "Axios",
        "MUI",
        "redux",
        "apexcharts",
        "...",
      ],
      image: "/rebornott.png",
    },
    {
      title: "Panda snack",
      href: "https://automatic.chat",
      dates: "Oct 2023 - Oct 2023",
      active: true,
      description:
        "Panda Snack is a MERN stack website designed for an online snack shop. The project offers a smooth user experience with dynamic product displays, secure checkout, and real-time order tracking, all managed through an intuitive and responsive interface.",
      technologies: [
        "React",
        "Node",
        "Express",
        "Mongodb",
        "TailwindCSS",
        "Context",
        "...",
      ],
      links: [
        {
          type: "Website",
          href: "https://panda-snack.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/MAFTOUH-Omar/panda_snack_front/",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/Panda.png",
    },
    {
      title: "Nano 4K",
      href: "",
      dates: "Aug 2024 - Sep 2024",
      active: true,
      description:
        "Panda Snack is a MERN stack website designed for an online snack shop. The project offers a smooth user experience with dynamic product displays, secure checkout, and real-time order tracking, all managed through an intuitive and responsive interface.",
      technologies: [
        "Laravel",
        "Inertia js",
        "Mysql",
        "TailwindCSS",
        "Context",
        "...",
      ],
      links: [
        {
          type: "Website",
          href: "https://panda-snack.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/MAFTOUH-Omar/panda_snack_front/",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/Nano.png",
    },
  ],
} as const;
