import type { Locale } from "@/lib/i18n";

/** UI copy and SEO metadata per locale. Résumé content lives in resume.tsx. */
export const dictionaries = {
  fr: {
    meta: {
      title: "Omar Maftouh — Développeur Full Stack à Casablanca, Maroc",
      description:
        "Omar Maftouh, développeur full stack à Casablanca (Maroc) : applications web sur mesure avec Next.js, React, Laravel, NestJS et Node.js, de l'API au déploiement.",
      ogTitle: "Développeur Full Stack à Casablanca, Maroc",
      keywords: [
        "développeur full stack Maroc",
        "développeur full stack Casablanca",
        "développeur web Maroc",
        "développeur freelance Maroc",
        "développeur Next.js Maroc",
        "développeur Laravel Maroc",
        "développeur React Casablanca",
        "Omar Maftouh",
      ],
    },
    hero: {
      greeting: "Salut, je suis Omar",
      role: "Développeur Full Stack · Casablanca, Maroc",
      cta: "Me contacter",
    },
    sections: {
      about: "À propos",
      work: "Expérience professionnelle",
      education: "Formation",
      skills: "Compétences",
    },
    projects: {
      badge: "Mes projets",
      title: "Découvrez mes derniers projets",
      intro:
        "J'ai travaillé sur des projets variés, du simple site vitrine aux applications web complexes. En voici quelques-uns parmi mes préférés.",
    },
    contact: {
      badge: "Contact",
      title: "Me contacter",
      before: "Envie d'échanger ? Envoyez-moi",
      link: "un message direct par e-mail",
      after:
        "et je vous répondrai dès que possible. Les sollicitations commerciales seront ignorées.",
      cv: "Téléchargez mon CV pour plus de détails.",
    },
    blog: {
      heading: "blog",
      title: "Blog",
      description:
        "Articles d'Omar Maftouh, développeur full stack au Maroc : développement web, Next.js, Laravel, Node.js et retours d'expérience.",
      empty: "Les premiers articles arrivent bientôt.",
    },
    nav: {
      home: "Accueil",
      blog: "Blog",
      theme: "Thème",
      email: "Envoyer un e-mail",
      switchLanguage: "Read in English",
    },
    a11y: {
      backToTop: "Retour en haut",
      previousImage: "Image précédente",
      nextImage: "Image suivante",
      goToImage: "Aller à l'image",
      screenshot: "Capture d'écran du projet",
    },
    notFound: {
      title: "Page introuvable",
      body: "Cette page n'existe pas ou a été déplacée.",
      back: "Retour à l'accueil",
    },
  },
  en: {
    meta: {
      title: "Omar Maftouh — Full Stack Developer in Casablanca, Morocco",
      description:
        "Omar Maftouh, full stack developer in Casablanca, Morocco: custom web applications with Next.js, React, Laravel, NestJS and Node.js, from API to deployment.",
      ogTitle: "Full Stack Developer in Casablanca, Morocco",
      keywords: [
        "full stack developer Morocco",
        "full stack developer Casablanca",
        "web developer Morocco",
        "freelance developer Morocco",
        "Next.js developer Morocco",
        "Laravel developer Morocco",
        "React developer Casablanca",
        "Omar Maftouh",
      ],
    },
    hero: {
      greeting: "Hi, I'm Omar",
      role: "Full Stack Developer · Casablanca, Morocco",
      cta: "Get in touch",
    },
    sections: {
      about: "About",
      work: "Work Experience",
      education: "Education",
      skills: "Skills",
    },
    projects: {
      badge: "My Projects",
      title: "Check out my latest work",
      intro:
        "I've worked on a variety of projects, from simple websites to complex web applications. Here are a few of my favorites.",
    },
    contact: {
      badge: "Contact",
      title: "Get in Touch",
      before: "Want to chat? Just shoot me a dm",
      link: "with a direct question on mail",
      after: "and I'll respond whenever I can. I will ignore all soliciting.",
      cv: "Feel free to download my CV for more details.",
    },
    blog: {
      heading: "blog",
      title: "Blog",
      description:
        "Articles by Omar Maftouh, full stack developer in Morocco: web development, Next.js, Laravel, Node.js and lessons learned.",
      empty: "First articles coming soon.",
    },
    nav: {
      home: "Home",
      blog: "Blog",
      theme: "Theme",
      email: "Send Email",
      switchLanguage: "Lire en français",
    },
    a11y: {
      backToTop: "Back to top",
      previousImage: "Previous image",
      nextImage: "Next image",
      goToImage: "Go to image",
      screenshot: "Screenshot of the project",
    },
    notFound: {
      title: "Page not found",
      body: "This page doesn't exist or has been moved.",
      back: "Back to home",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
