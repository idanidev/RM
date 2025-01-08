import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Reemplaza con tu endpoint de Appwrite
  .setProject('YOUR_PROJECT_ID'); // Reemplaza con tu ID de proyecto

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
