import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Reemplaza con tu endpoint de Appwrite
  .setProject('677802c40031f81cd5b1'); // Reemplaza con tu ID de proyecto

const account = new Account(client);
const databases = new Databases(client);

export { ID } from 'appwrite';
export { client, account, databases };
