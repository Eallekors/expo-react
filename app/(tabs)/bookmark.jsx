import { Text, View, FlatList, Image, RefreshControl, Alert, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../constants';
import EmptyState from '../../components/EmptyState';
import { getAllPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider'; // Import the context to get user info

const Bookmark = () => {
  const { user } = useGlobalContext(); // Get the current user
  const { data: posts, refetch } = useAppwrite(getAllPosts);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for the search query

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Filter posts based on the current user's ID
  const filteredPosts = posts?.filter(post => 
    post.users && post.users.includes(user.accountId) // Ensure the post has a users array and includes the current user's ID
  );

  // Filter the posts based on the search query
  const searchedPosts = filteredPosts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by title
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
            onChangeText={setSearchQuery} // Update the search query
          />
          <TouchableOpacity
            onPress={() => {
              // You could add functionality for pressing the search icon here if needed
            }}
          >
            <Image 
              source={icons.search} // Make sure to import your search icon
              className='w-5 h-5'
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={searchedPosts} // Use the searchedPosts for FlatList data
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
          video={item} // this passes the rest of the video details
          videoid={item.$id} // explicitly passing the video ID
          onUpdate={refetch}
        />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No Videos found for this search"
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
