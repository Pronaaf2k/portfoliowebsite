export interface Language {
  name: string;
  iconName: string;
  className?: string;
}

export const languages: Record<string, Language> = {
  // Existing Tech (partial list for context, add remaining if needed)
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
  // --- Custom additions for Samiyeel's stack ---
  python: {
    name: "Python",
    iconName: "python",
  },
  java: {
    name: "Java",
    iconName: "code", // Placeholder: No specific icon in src/icons
  },
  cplusplus: {
    name: "C++",
    iconName: "code", // Placeholder
  },
  reactjs: {
    name: "ReactJS",
    iconName: "code", // Placeholder
  },
  flutter: {
    name: "Flutter",
    iconName: "code", // Placeholder
  },
  tensorflow: {
    name: "TensorFlow",
    iconName: "code", // Placeholder
  },
  pytorch: {
    name: "PyTorch",
    iconName: "code", // Placeholder
  },
  numpy: {
    name: "NumPy",
    iconName: "code", // Placeholder
  },
  pandas: {
    name: "Pandas",
    iconName: "code", // Placeholder
  },
  krita: {
    name: "Krita",
    iconName: "info", // Placeholder for design tool
  },
  illustrator: {
    name: "Illustrator",
    iconName: "info", // Placeholder for design tool
  },
  premiere: {
    name: "Premiere Pro",
    iconName: "info", // Placeholder for design tool
  },
  sketchbook: {
    name: "Autodesk SketchBook",
    iconName: "info", // Placeholder for design tool
  },
  // --- End Custom additions ---
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