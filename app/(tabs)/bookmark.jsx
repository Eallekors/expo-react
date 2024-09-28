import { Text, View, FlatList, Image, RefreshControl, Alert, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@constants'; 
import EmptyState from '@components/EmptyState'; 
import { getAllPosts } from '@lib/appwrite'; 
import useAppwrite from '@lib/useAppwrite'; 
import VideoCard from '@components/VideoCard'; 
import { useGlobalContext } from '@context/GlobalProvider';

const Bookmark = () => {
  const { user } = useGlobalContext(); 
  const { data: posts, refetch } = useAppwrite(getAllPosts);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  
  const filteredPosts = posts?.filter(post => 
    post.users && post.users.includes(user.accountId) 
  );


  const searchedPosts = filteredPosts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="my-6 px-4 space-y-6">
        <Text className="text-2xl font-psemibold text-white">
          Saved Videos
        </Text>

        {/* Search Input */}
        <View className="border-2 border-blakc-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
          <TextInput 
            className="text-base mt-0.5 text-white flex-1 font-pregular"
            value={searchQuery}
            placeholder="Search for a video topic"
            placeholderTextColor="#CDCDE0"
            onChangeText={setSearchQuery} 
          />
          <TouchableOpacity>
            <Image 
              source={icons.search} 
              className='w-5 h-5'
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={searchedPosts} 
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
          video={item} 
          videoid={item.$id} 
          onUpdate={refetch}
        />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Bookmark a video to see them here"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
