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
      available: "Disponible pour de nouveaux projets",
    },
    sections: {
      about: "À propos",
      work: "Expérience professionnelle",
      education: "Formation",
      skills: "Compétences",
    },
    skills: {
      contributions: "{n} contributions sur GitHub cette année",
      day: "{n} contribution(s) le {date}",
      noDay: "Aucune contribution le {date}",
      less: "Moins",
      more: "Plus",
      logos: "Technologies que j'utilise",
    },
    projects: {
      title: "Projets",
      intro:
        "J'ai travaillé sur des projets variés, du simple site vitrine aux applications web complexes. En voici quelques-uns parmi mes préférés.",
    },
    contact: {
      title: "Contact",
      headline: "Travaillons ensemble",
      body: "Un projet web, une mission freelance ou un poste à pourvoir ? Écrivez-moi, je réponds rapidement.",
      email: "M'écrire",
      copy: "Copier l'e-mail",
      copied: "E-mail copié !",
      cv: "Télécharger le CV",
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
      close: "Fermer",
      details: "Voir les détails",
      stack: "Stack technique",
      visit: "Voir le projet",
    },
    cookies: {
      title: "Cookies & confidentialité",
      text: "J'utilise une mesure d'audience anonyme, sans cookies publicitaires, pour savoir quelles pages sont consultées. Vous acceptez ?",
      accept: "Accepter",
      reject: "Refuser",
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
      available: "Available for new projects",
    },
    sections: {
      about: "About",
      work: "Work Experience",
      education: "Education",
      skills: "Skills",
    },
    skills: {
      contributions: "{n} contributions on GitHub in the last year",
      day: "{n} contribution(s) on {date}",
      noDay: "No contributions on {date}",
      less: "Less",
      more: "More",
      logos: "Technologies I use",
    },
    projects: {
      title: "Projects",
      intro:
        "I've worked on a variety of projects, from simple websites to complex web applications. Here are a few of my favorites.",
    },
    contact: {
      title: "Contact",
      headline: "Let's work together",
      body: "A web project, a freelance mission or an open role? Drop me a line — I reply quickly.",
      email: "Email me",
      copy: "Copy email",
      copied: "Email copied!",
      cv: "Download CV",
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
      close: "Close",
      details: "View details",
      stack: "Tech stack",
      visit: "Visit project",
    },
    cookies: {
      title: "Cookies & privacy",
      text: "I use anonymous audience measurement, with no advertising cookies, to see which pages are read. Is that OK with you?",
      accept: "Accept",
      reject: "Decline",
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
