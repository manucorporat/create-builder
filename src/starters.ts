export interface Starter {
  name: string;
  repo?: string;
  script?: string;
  description?: string;
  docs?: string;
  hidden?: boolean;
  prefix?: string;
}

export const STARTERS: Starter[] = [
  {
    name: 'nextjs',
    repo: 'manucorporat/test-builder-starter',
    description: 'Get starter with a server-side rendering nextjs starter',
    docs: 'https://github.com/BuilderIO/nextjs-shopify#readme',
  },

  // {
  //   name: 'nexjs-shopify',
  //   repo: 'BuilderIO/nextjs-shopify',
  //   description: 'The ultimate starter for headless Shopify stores',
  //   docs: 'https://github.com/BuilderIO/nextjs-shopify#readme',
  // },
  // {
  //   name: 'gatsby-basic',
  //   repo: 'BuilderIO/gatsby-starter-builder',
  //   description: 'Gatsby starter with drag and drop page building',
  //   docs: 'https://github.com/BuilderIO/gatsby-starter-builder',
  // },
  {
    name: 'react-basic',
    repo: 'BuilderIO/builder-react-example-starter',
    description: 'A basic example of using Builder with React',
    docs: 'https://github.com/BuilderIO/builder-react-example-starter',
  },
];

export function getStarterRepo(starterName: string): Starter {
  if (starterName.includes('/')) {
    return {
      name: starterName,
      repo: starterName,
    };
  }
  const repo = STARTERS.find(starter => starter.name === starterName);
  if (!repo) {
    throw new Error(`Starter "${starterName}" does not exist.`);
  }
  return repo;
}
