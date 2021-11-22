import open from 'open';

const HOST = 'http://localhost:1234';
export const openBuilder = async (projectName: string, port: number = 3000) => {
  const overridePreviewUrl = encodeURIComponent(`http://localhost:${port}`);
  open(`${HOST}/onboarding/simple?overridePreviewUrl=${overridePreviewUrl}&project_name=${projectName}`, {
    app: {
      name: 'google chrome',
    },
  });
};
