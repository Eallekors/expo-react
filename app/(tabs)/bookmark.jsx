import { Text, View, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images,icons } from '../../constants'
import SearchInput from '../../components/SearchInput'
import Trending from '../../components/Trending'
import EmptyState from '../../components/EmptyState'
import { getAllPosts, getLatestPosts, getUserPosts, searchPosts } from '../../lib/appwrite'
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import { useLocalSearchParams } from 'expo-router'
import InfoBox from '../../components/InfoBox'
import { router } from 'expo-router'
import { useGlobalContext } from '../../context/GlobalProvider'
import { TouchableOpacity } from 'react-native'
import { signOut } from '../../lib/appwrite'; 


const Bookmark = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id));
  
  const logout = async () => {
    await signOut();  
    // setUser(null);
    //setIsLoggedIn(false); 

    router.replace("/sign-in");
  } 

  
  
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={( item ) => item.$id}
        renderItem={({ item }) => (
          <VideoCard 
            video={item}
          />
        )}
        ListHeaderComponent={() => (
          <View className="px-4 my-6">
            <Text className="text-2xl text-white font-psemibold">
            Saved Videos
            </Text> 
            <SearchInput />
          </View>
        )}
        ListEmptyComponent={() => (
         <EmptyState
          title="No Videos Found"
          subtitle="No Videos found for this search"
         />
        )}
        
      />
      
    </SafeAreaView>
  )
}

export default Bookmark

