import React, { useState } from 'react'
import { View, Button, Image, StyleSheet, Text, Alert, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'YOUR_VERCEL_API_URL'

export default function OnboardingScreen({ navigation }: any) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function pickImage() {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri])
    }
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri])
    }
  }

  async function uploadAndAnalyze() {
    if (images.length !== 3) {
      Alert.alert('Please upload exactly 3 images')
      return
    }

    setLoading(true)
    const user = (await supabase.auth.getUser()).data.user!
    const analyses: any[] = []

    try {
      // Upload images and analyze
      for (let i = 0; i < images.length; i++) {
        // Convert image to blob
        const response = await fetch(images[i])
        const blob = await response.blob()
        const fileName = `${user.id}/${Date.now()}-${i}.jpg`

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-images')
          .upload(fileName, blob, {
            contentType: 'image/jpeg'
          })

        if (uploadError) {
          Alert.alert('Upload failed', uploadError.message)
          setLoading(false)
          return
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('user-images')
          .getPublicUrl(fileName)

        // Call analysis API
        const analysisResponse = await fetch(`${API_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: publicUrl })
        })
        const analysis = await analysisResponse.json()
        analyses.push(analysis)

        // Save to database
        await supabase.from('user_objects').insert({
          user_id: user.id,
          image_url: publicUrl,
          analysis: analysis
        })
      }

      // Aggregate personality
      const allTraits = analyses.flatMap(a => a.traits || [])
      const summary = analyses.map(a => a.description).join(' ')

      await supabase.from('user_profiles').update({
        personality_traits: allTraits,
        personality_summary: summary,
        onboarded: true
      }).eq('id', user.id)

      setLoading(false)
      navigation.replace('Home')
    } catch (error: any) {
      Alert.alert('Error', error.message)
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Upload 3 Objects That Define You</Text>
      <Text style={styles.subtitle}>
        Choose items that reflect your personality - they could be food, furniture, nature, or anything meaningful to you
      </Text>
      <View style={styles.imageGrid}>
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.image} />
        ))}
        {[...Array(3 - images.length)].map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptyImage}>
            <Text style={styles.emptyText}>+</Text>
          </View>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Take Photo" onPress={pickImage} disabled={images.length >= 3 || loading} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Choose from Library" onPress={pickFromLibrary} disabled={images.length >= 3 || loading} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Analyzing..." : "Continue"}
          onPress={uploadAndAnalyze}
          disabled={images.length !== 3 || loading}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10
  },
  emptyImage: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed'
  },
  emptyText: {
    fontSize: 40,
    color: '#ccc'
  },
  buttonContainer: {
    marginTop: 10
  }
})
