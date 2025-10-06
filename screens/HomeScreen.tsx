import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Button } from 'react-native'
import { supabase } from '../lib/supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'YOUR_VERCEL_API_URL'

export default function HomeScreen({ navigation }: any) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    setLoading(true)
    const user = (await supabase.auth.getUser()).data.user!

    // Generate matches if none exist for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', user.id)
      .eq('created_at', today)

    if (!existing || existing.length === 0) {
      try {
        await fetch(`${API_URL}/api/generate-matches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })
      } catch (error) {
        console.error('Error generating matches:', error)
      }
    }

    // Load matches with user details
    const { data: matchData } = await supabase
      .from('matches')
      .select(`
        *,
        matched_user:user_profiles!matches_matched_user_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .eq('created_at', today)

    setMatches(matchData || [])
    setLoading(false)
  }

  function viewMatch(match: any) {
    navigation.navigate('Profile', { userId: match.matched_user_id })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigation.replace('Login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Matches</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
      <Text style={styles.subtitle}>3 people who complement your vibe</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMatches} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches yet. Pull to refresh!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => viewMatch(item)}>
            <View style={styles.cardContent}>
              <Text style={styles.matchName}>Mystery Match</Text>
              <Text style={styles.matchDescription} numberOfLines={3}>
                {item.matched_user?.personality_summary || 'Loading...'}
              </Text>
              <Text style={styles.viewProfile}>Tap to view their objects →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardContent: {
    padding: 20
  },
  matchName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10
  },
  matchDescription: {
    color: '#444',
    lineHeight: 20,
    marginBottom: 10
  },
  viewProfile: {
    color: '#007AFF',
    fontWeight: '600'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#999',
    fontSize: 16
  }
})
