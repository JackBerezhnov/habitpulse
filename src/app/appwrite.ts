import { Client, Account, Databases, Avatars, OAuthProvider } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(`${process.env.NEXT_PUBLIC_PROJECT_ID}`);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Databases(client);
export const avatars = new Avatars(client);
export { ID, OAuthProvider } from 'appwrite';