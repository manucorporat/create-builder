import { join } from 'path';
import { userInfo } from 'os';
import { readJSON, existsSync, outputJSON } from 'fs-extra';
import http from 'http';
import open from 'open';
import { bold, dim, yellowBright } from 'colorette';
import { Spinner } from 'cli-spinner';

interface Credentials {
  version: '1';
  privateKey?: string;
  apiKey?: string;
}

let credential: Credentials | undefined;

export const getCredentialsFilePath = () => {
  const info = userInfo();
  return join(info.homedir, '.config', 'builder', 'credentials.json');
}

export const getLogin = async () => {
  if (credential) {
    return credential;
  }
  const credentialsPath = getCredentialsFilePath();
  try {
    if (existsSync(credentialsPath)) {
      const file = await readJSON(credentialsPath);
      if (typeof file === 'object' && file != null && file.version === '1') {
        credential = file;
        return credential;
      }
    }
  } catch (err) {
    console.error(err);
    return undefined;
  }
  return await login()
};

export const mustLogin = async () => {
  const login = await getLogin();
  if (!login) {
    throw new Error('Login with builder.io failed');
  }
  return login;
};

export const mustGetApiKey = async () => {
  const l = await mustLogin();
  if (!l.apiKey) {
    return (await login()).apiKey;
  }
  return l.apiKey;
};

export const mustGetPrivateKey = async () => {
  const l = await mustLogin();
  if (!l.privateKey) {
    return (await login()).privateKey;
  }
  return l.privateKey;
};

export const login = async () => {
  const token = await getNewToken();
  credential = await saveLogin(token);
  return credential as Required<Credentials>;
};

interface LoginData {
  privateKey: string;
  apiKey: string;
}

export const saveLogin = async (input: Partial<LoginData>): Promise<Credentials> => {
  const credentialsPath = getCredentialsFilePath();
  const data: Credentials = {
    ...(credential || {}),
    version: '1',
  };
  if (input.privateKey) {
    data.privateKey = input.privateKey;
  }
  if (input.apiKey) {
    data.apiKey = input.apiKey;
  }
  credential = data;
  await outputJSON(credentialsPath, data);
  return data;
};

const CLIENT_ID = 'create-builder';
const PORT = 10110;

const getNewToken = () => {
  const params = new URLSearchParams();
  params.set('response_type', 'code');
  params.set('client_id', CLIENT_ID);
  const loading = new Spinner(bold(' Waiting for authorization...'));
  const authUrl = 'https://builder.io/content?' + params.toString();
  return new Promise<LoginData>((resolve, reject) => {
    const server = http
      .createServer((req, res) => {
        if (req.method !== 'GET') {
          reject(new Error('Bad method'));
          return;
        }
        const parsedUrl = new URL(req.url!);
        if (parsedUrl.pathname !== "auth") {
          reject(new Error('Bad path'));
          return;
        }
        const queryAsObject = parsedUrl.searchParams;
        const privateKey = queryAsObject.get('p-key');
        if (!privateKey) {
          reject(new Error('Missing p-key'));
          return;
        }

        const apiKey = queryAsObject.get('api-key');
        if (!apiKey) {
          reject(new Error('Missing api-key'));
          return;
        }

        res.writeHead(302, {
          Location: 'https://builder.io/cli-auth?success=true',
        });
        res.end();
        req.socket.end();
        req.socket.destroy();
        server.close();
        loading.stop(true);
        resolve({
          privateKey,
          apiKey
        });
      })
      .listen(PORT);

    // opens browser to the authorizationURL (auth consent form in Smartsheet)
    console.log(`\n🔑 ${yellowBright(bold("Login required"))}
${dim("   Your browser will open, please follow the instructions.")}\n`);

    loading.setSpinnerString(8);
    loading.start();

    open(authUrl);
  });
}