import {Account,Avatars,Client,Databases,ID,Query,Storage} from "react-native-appwrite";

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '66f5b0a3001173eec422',
    databaseId: '66f5b1cc0011868bbcc8',
    userCollectionId: '66f5b1e800301dd843d3',
    videoCollectionId: '66f5b20a001927b88db8',
    storageId: '66f5b30300291f12ad7e'
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
// Register user
export async function createUser(email, password, username) {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        username
      );
  
      if (!newAccount) throw Error;
  
      const avatarUrl = avatars.getInitials(username);
  
      await signIn(email, password);
  
      const newUser = await databases.createDocument(
        config.databaseId,
        config.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email: email,
          username: username,
          avatar: avatarUrl,
        }
      );
  
      return newUser;
    } catch (error) {
      throw new Error(error);
    }
  }

  // Sign In
  export const signIn = async (email, password) => {
    try {
      let currentSession;
      try {
        currentSession = await account.getSession("current");
      } catch (error) {
        // Handle session not found error here (this might be expected for a guest user)
      }
  
      if (currentSession) return currentSession;
  
      const newSession = await account.createEmailPasswordSession(email, password);
      return newSession;
    } catch (error) {
      throw new Error(error.message); // Adjusted to error.message for clarity
    }
  }
   
  export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0]
    }catch (error) {
        console.log(error)
    }
  }

  export async function getAllPosts() {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export async function getLatestPosts() {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(7)]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const  searchPosts = async (query) => {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.search("title", query)]
      );

      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const getUserPosts = async (userId) => {
    try {
      const posts = await databases.listDocuments(
        databaseId,
        videoCollectionId,
        [Query.equal("creator", userId)]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }