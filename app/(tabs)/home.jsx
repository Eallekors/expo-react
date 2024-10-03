import { Text, View, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';


import { images } from '@constants';
import SearchInput from '@components/SearchInput';
import Trending from '@components/Trending';
import EmptyState from '@components/EmptyState';
import { getAllPosts, getLatestPosts } from '@lib/appwrite';
import useAppwrite from '@lib/useAppwrite';
import VideoCard from '@components/VideoCard';
import { useGlobalContext } from '@context/GlobalProvider';


const Home = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  
  const { data: posts, refetch: refetchPosts } = useAppwrite(getAllPosts);

  const { data: latestposts ,refetch: refetchLatestPosts} = useAppwrite(getLatestPosts);

  const [refreshing, setRefreshing] = useState(false)

  const { refresh } = useLocalSearchParams(); // Use useLocalSearchParams to get 'refresh' parameter

  
  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchPosts(), refetchLatestPosts()]); // Refetch both the main posts and latest posts
    
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        onRefresh();
      }
    }, [refresh])
  );



  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={( item ) => item.$id}
        
        renderItem={({ item }) => (
          <VideoCard
          video={item} // this passes the rest of the video details
          videoid={item.$id} // explicitly passing the video ID
          onUpdate={onRefresh}
        />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput title="Search for a video topic" />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Latest Videos
              </Text>

              <Trending posts={latestposts ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
         <EmptyState
          title="No Videos Found"
          subtitle="Be the first one to upload a video"
         />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
    </SafeAreaView>
  )
}

export default Home

