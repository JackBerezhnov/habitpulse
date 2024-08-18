import { Client, Account, Databases, Avatars } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(`${process.env.NEXT_PUBLIC_PROJECT_ID}`);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Databases(client);
export const avatars = new Avatars(client);
export { ID } from 'appwrite';