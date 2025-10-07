export interface Language {
  name: string;
  iconName: string;
  className?: string;
}

export const languages: Record<string, Language> = {
  angular: {
    name: "Angular",
    iconName: "angular",
  },
  astro: {
    name: "Astro",
    iconName: "astro",
  },
  bootstrap: {
    name: "Bootstrap",
    iconName: "bootstrap",
  },
  cloudflare: {
    name: "Cloudflare",
    iconName: "cloudflare",
  },
  html: {
    name: "HTML 5",
    iconName: "html",
  },
  javascript: {
    name: "JavaScript",
    iconName: "javascript",
  },
  tailwind: {
    name: "Tailwind CSS",
    iconName: "tailwind",
  },
  firebase: {
    name: "Firebase",
    iconName: "firebase",
  },
  python: {
    name: "Python",
    iconName: "python",
  },
  java: {
    name: "Java",
    iconName: "code", 
  },
  cplusplus: {
    name: "C++",
    iconName: "code", 
  },
  reactjs: {
    name: "ReactJS",
    iconName: "code", 
  },
  flutter: {
    name: "Flutter",
    iconName: "code", 
  },
  tensorflow: {
    name: "TensorFlow",
    iconName: "code", 
  },
  pytorch: {
    name: "PyTorch",
    iconName: "code", 
  },
  numpy: {
    name: "NumPy",
    iconName: "code", 
  },
  pandas: {
    name: "Pandas",
    iconName: "code", 
  },
  krita: {
    name: "Krita",
    iconName: "info", 
  },
  illustrator: {
    name: "Illustrator",
    iconName: "info", 
  },
  premiere: {
    name: "Premiere Pro",
    iconName: "info", 
  },
  sketchbook: {
    name: "Autodesk SketchBook",
    iconName: "info", 
  },
  mongo: {
    name: "MongoDb",
    iconName: "mongo",
  },
  mysql: {
    name: "MySQL",
    className: "bg-[#f6ece1]!",
    iconName: "mysql",
  },
  wordpress: {
    name: "Wordpress",
    iconName: "wordpress",
  },
  node: {
    name: "Node.js",
    iconName: "node",
  },
  figma: {
    name: "Figma",
    iconName: "figma",
  },
  markdown: {
    name: "Markdown",
    iconName: "markdown",
  },
  php: {
    name: "PHP",
    iconName: "php",
  },
  sass: {
    name: "Sass",
    iconName: "sass",
  },
  ts: {
    name: "TypeScript",
    iconName: "typescript",
  },
  git: {
    name: "Git",
    iconName: "git",
  },
  css: {
    name: "CSS",
    iconName: "css",
  },
  vercel: {
    name: "Vercel",
    iconName: "vercel",
  },
  netlify: {
    name: "Netlify",
    iconName: "netlify",
  },
  gatsby: {
    name: "Gatsby",
    iconName: "gatsby",
  },
  windsurf: {
    name: "Windsurf",
    iconName: "windsurf-logo",
  },
  cursor: {
    name: "Cursor",
    iconName: "cursor-ia",
  },
  deepseek: {
    name: "DeepSeek",
    iconName: "deepseek",
  },
};

export const getLanguage = (lang: string): Language => {
  return languages[lang] || { name: lang, iconName: "info" }; // Fallback
};