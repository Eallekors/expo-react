import { View, Text, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { icons } from '@constants';
import { handleVideoId } from '@lib/appwrite';
import { useGlobalContext } from '@context/GlobalProvider';

const VideoCard = ({video : {title,thumbnail,video,creator: { username, avatar} , users},videoid ,onUpdate  }) => {
    const [play, setPlay] = useState(false);
    const { user, setUser, setIsLoggedIn } = useGlobalContext();
    const [isBookmarked, setIsBookmarked] = useState(users.includes(user?.accountId)); // Check if the user is in the users array
    


    const handleBookmark = async () => {
      await handleVideoId(users, user.accountId, videoid);
      setIsBookmarked(!isBookmarked);
      onUpdate(); 
  };
    
    return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className=" justify-center items-center flex-row flex-1">
            <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
                <Image source={{ uri: avatar}} className="w-full h-full rounded-lg" resizeMode="cover" />
            </View>

            <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text className="text-white font-psemibold text-sm " numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
              {username}
            </Text>
          </View>
        </View>
        
            <View className="pt-2">
              <TouchableOpacity activeOpacity={0.7} onPress={handleBookmark}>
                <Image source={isBookmarked ? icons.heartFilled : icons.heart} className="w-5 h-5" resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <View className="pt-2">
                
                <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
               
            </View>
      </View>
        {play ? (
            <Video 
            source={{ uri: video }}
            className="w-full h-60 rounded-xl mt-3 bg-white/10"
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                setPlay(false);
              }
            }}
            />
        ) : (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setPlay(true)} className='w-full h-60 rounded-xl mt-3 relative justify-center items-center'> 
                <Image source={{ uri: thumbnail }} className="w-full h-full rounded-xl mt-3" resizeMode="cover" />
                <Image source={icons.play} className="w-12 h-12 absolute" resizeMode="contain"/>
            </TouchableOpacity>
        )}
    </View>
  )
}

export default VideoCard