// Test login functionality for the 3 mock users
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testUsers = [
  { email: 'artist.creative@test.com', password: 'test123456', name: 'Artistic Soul' },
  { email: 'explorer.wild@test.com', password: 'test123456', name: 'Adventure Seeker' },
  { email: 'minimal.tech@test.com', password: 'test123456', name: 'Tech Minimalist' }
]

async function testLogin(user) {
  console.log(`\n👤 Testing login for ${user.name} (${user.email})`)

  try {
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    })

    if (error) {
      console.log(`   ❌ Login failed: ${error.message}`)
      return null
    }

    console.log(`   ✅ Login successful!`)
    console.log(`   User ID: ${data.user.id}`)
    console.log(`   Email: ${data.user.email}`)

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.log(`   ⚠️  Profile fetch failed: ${profileError.message}`)
    } else {
      console.log(`   ✅ Profile loaded:`)
      console.log(`      Onboarded: ${profile.onboarded}`)
      console.log(`      Traits: ${profile.personality_traits?.length || 0}`)
      console.log(`      Summary: ${profile.personality_summary?.substring(0, 80)}...`)
    }

    // Sign out
    await supabase.auth.signOut()
    console.log(`   ✅ Signed out`)

    return data.user

  } catch (error) {
    console.log(`   ❌ Unexpected error: ${error.message}`)
    return null
  }
}

async function testAllLogins() {
  console.log('🧪 Testing Login for 3 Mock Users')
  console.log('=' .repeat(60))

  const results = []

  for (const user of testUsers) {
    const result = await testLogin(user)
    results.push(result)
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Test complete! ${results.filter(r => r !== null).length}/3 users logged in successfully\n`)
}

testAllLogins()
