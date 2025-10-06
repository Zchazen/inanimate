import React, { useEffect, useState, useRef } from 'react'
import { View, Text, FlatList, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { supabase } from '../lib/supabase'

export default function ChatScreen({ route }: any) {
  const { chatId, matchedUserId } = route.params
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadMessages()
    setupRealtimeSubscription()
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    const user = (await supabase.auth.getUser()).data.user!
    setCurrentUserId(user.id)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return

    const user = (await supabase.auth.getUser()).data.user!

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      content: newMessage.trim()
    })

    setNewMessage('')
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender_id === currentUserId ? styles.myMessage : styles.theirMessage
          ]}>
            <Text style={[
              styles.messageText,
              item.sender_id === currentUserId && styles.myMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.timestamp,
              item.sender_id === currentUserId && styles.myTimestamp
            ]}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <Button title="Send" onPress={sendMessage} disabled={!newMessage.trim()} />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  messagesList: {
    padding: 10
  },
  messageBubble: {
    padding: 12,
    margin: 5,
    borderRadius: 18,
    maxWidth: '75%'
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end'
  },
  theirMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start'
  },
  messageText: {
    fontSize: 16,
    color: '#000'
  },
  myMessageText: {
    color: '#fff'
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    marginTop: 4
  },
  myTimestamp: {
    color: '#fff',
    opacity: 0.8
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16
  }
})
