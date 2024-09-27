import { Text, View, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import Trending from '../../components/Trending'
import EmptyState from '../../components/EmptyState'
import { getAllPosts, getLatestPosts, searchPosts } from '../../lib/appwrite'
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import { useLocalSearchParams } from 'expo-router'

const Search = () => {
  const { query } = useLocalSearchParams()
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query));

  useEffect(() => {
    refetch()
  }, [query])
  

  const [refreshing, setRefreshing] = useState(false)
  
  const onRefresh = async () => {
    setRefreshing(true)
    await refetch();
    setRefreshing(false)
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
          <View className="my-6 px-4 ">
              <Text className="font-pmedium text-sm text-gray-100">
                Search Results
              </Text>

              <Text className="text-2xl font-psemibold text-white">
                {query}
              </Text>
              
              <View className="mt-6 mb-8">
                <SearchInput initialQuery={query} />
              </View>
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

export default Search

