import React, { useEffect, useState } from 'react'
import { View, Text, Image, FlatList, StyleSheet, Button, ScrollView } from 'react-native'
import { supabase } from '../lib/supabase'

export default function ProfileScreen({ route, navigation }: any) {
  const { userId } = route.params
  const [profile, setProfile] = useState<any>(null)
  const [objects, setObjects] = useState<any[]>([])

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: objectsData } = await supabase
      .from('user_objects')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    setProfile(profileData)
    setObjects(objectsData || [])
  }

  async function startChat() {
    const currentUser = (await supabase.auth.getUser()).data.user!

    // Create or get chat
    const { data: existingChat } = await supabase
      .from('chats')
      .select('*')
      .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${currentUser.id})`)
      .maybeSingle()

    let chatId = existingChat?.id

    if (!chatId) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert({ user1_id: currentUser.id, user2_id: userId })
        .select()
        .single()
      chatId = newChat!.id
    }

    navigation.navigate('Chat', { chatId, matchedUserId: userId })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>About Them</Text>
        <Text style={styles.summary}>{profile?.personality_summary || 'Loading...'}</Text>

        {profile?.personality_traits && profile.personality_traits.length > 0 && (
          <View style={styles.traitsContainer}>
            {profile.personality_traits.slice(0, 5).map((trait: string, index: number) => (
              <View key={index} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.objectsSection}>
        <Text style={styles.sectionTitle}>Their Objects</Text>
        <FlatList
          data={objects}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.objectCard}>
              <Image source={{ uri: item.image_url }} style={styles.objectImage} />
              {item.analysis?.vibe && (
                <Text style={styles.objectVibe}>{item.analysis.vibe}</Text>
              )}
            </View>
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Start Chat" onPress={startChat} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontStyle: 'italic'
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15
  },
  traitBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4
  },
  traitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  objectsSection: {
    padding: 20
  },
  objectCard: {
    flex: 1,
    margin: 5,
    alignItems: 'center'
  },
  objectImage: {
    width: '100%',
    height: 150,
    borderRadius: 10
  },
  objectVibe: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 14
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40
  }
})
