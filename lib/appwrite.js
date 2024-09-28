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
    .setEndpoint(config.endpoint) 
    .setProject(config.projectId) 
    .setPlatform(config.platform) 

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

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


  export const signIn = async (email, password) => {
    try {
      let currentSession;
      
      try {
        currentSession = await account.getSession("current");
      } catch (error) {
        // Handle session not found error here (this might be expected for a guest user)
      }
  
      if (currentSession) {
         // Set the user in global state
        return currentSession;
      } 
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
        videoCollectionId,
        [Query.orderDesc("$createdAt")]
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
        [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const  signOut = async () => {
    try {
      const session = await account.deleteSession("current");
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
      if(type === 'video') {
        fileUrl = storage.getFileView(storageId, fileId)
      } else if (type === 'image') {
        fileUrl = storage.getFilePreview(storageId,
          fileId, 2000, 2000, 'top', 100)
      }else{
        throw new Error('Invalid file type')
      }

      if(!fileUrl) throw Error;

      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }

  }

  export const uploadFile = async (file, type) => {
    if(!file) return;

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };
    try {
      const uploadedFile = await storage.createFile(
        storageId,
        ID.unique(),
        asset
      )
      
    
      const fileUrl = await getFilePreview(uploadedFile.$id, type);

      return fileUrl;
    } catch (error) {
      throw new Error(error)
    }
  }

  export const createVideo = async (form) => {
    try {
      const [thumbnailUrl, videoUrl] = await Promise.all([
        uploadFile(form.thumbnail, "image"),
        uploadFile(form.video, "video"),
      ]);
      
      const newPost = await databases.createDocument(
        databaseId,
        videoCollectionId,
        ID.unique(),
        {
          title: form.title,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          prompt: form.prompt,
          creator: form.userId,
        }
      );
  
      return newPost;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const handleVideoId = async (userArray, user, videoId) => {
    console.log("Users : ", userArray);
    console.log("Account : ", user);
    console.log("Video ID: ", videoId);
    try {
        const currentUserId = user; // Assuming 'user' is the object representing the current logged-in user
        
        // Check if the user is already in the array
        if (userArray.includes(currentUserId)) {
            // Create a new array without the current user ID
            const updatedUsers = userArray.filter(id => id !== currentUserId);
            console.log("Updated users after removal:", updatedUsers); // Log the updated array
            
            // Update the database
            await databases.updateDocument(
                databaseId, // Your database ID
                videoCollectionId, // Your videos collection ID
                videoId, // The ID of the video document you want to update
                {
                    users: updatedUsers, // Update the 'users' field with the new array
                }
            );

            console.log("User removed from the array."); // Inform that the user was removed
        } else {
            // Create a new array with the current user ID added
            const updatedUsers = [...userArray, currentUserId];
            console.log("Updated users after addition:", updatedUsers); // Log the updated array
            
            // Update the database
            await databases.updateDocument(
                databaseId, // Your database ID
                videoCollectionId, // Your videos collection ID
                videoId, // The ID of the video document you want to update
                {
                    users: updatedUsers, // Update the 'users' field with the new array
                }
            );

            console.log("User added to the array."); // Inform that the user was added
        }
    } catch (error) {
        console.error("Error updating users array:", error.message);
    }
};
