import React, { useState } from 'react'
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native'
import { supabase } from '../lib/supabase'

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      Alert.alert('Login failed', error.message)
    } else {
      // Check if user has onboarded
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarded')
        .eq('id', data.user.id)
        .single()

      if (profile?.onboarded) {
        navigation.replace('Home')
      } else {
        navigation.replace('Onboarding')
      }
    }
    setLoading(false)
  }

  async function signUp() {
    setLoading(true)
    const { error, data } = await supabase.auth.signUp({ email, password })

    if (error) {
      Alert.alert('Sign up failed', error.message)
    } else {
      // Create profile
      await supabase.from('user_profiles').insert({
        id: data.user!.id,
        email: email,
        onboarded: false
      })
      navigation.replace('Onboarding')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Object Dating</Text>
      <Text style={styles.subtitle}>Find your match through the things you love</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={signIn} disabled={loading} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={signUp} disabled={loading} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40
  },
  input: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    fontSize: 16
  },
  buttonContainer: {
    marginTop: 10
  }
})
