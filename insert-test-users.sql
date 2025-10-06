-- SQL script to insert 3 test users directly
-- Run this in Supabase SQL Editor

-- User 1: Artistic Soul
INSERT INTO user_profiles (id, email, personality_traits, personality_summary, onboarded)
VALUES (
  'de0417ca-9a68-42e5-813d-aa42f815bcb3',
  'artist.creative@test.com',
  '["creative", "nostalgic", "detail-oriented", "introspective", "artistic", "authentic", "warm", "appreciative", "mindful", "grounded", "thoughtful", "expressive", "romantic", "deep", "vulnerable"]',
  'Someone who values authentic moments and sees beauty in the analog world, deeply reflective and emotionally expressive. Values craftsmanship and meaningful connections, approaches life with intention and emotional depth. Emotionally open and values deep self-expression, builds connections through sharing inner thoughts.',
  true
);

-- User 2: Adventure Seeker
INSERT INTO user_profiles (id, email, personality_traits, personality_summary, onboarded)
VALUES (
  '90262bf7-c48f-4aed-a6d2-d96cf110fe7f',
  'explorer.wild@test.com',
  '["adventurous", "energetic", "spontaneous", "brave", "outdoorsy", "curious", "independent", "open-minded", "adaptable", "free-spirited", "purposeful", "determined", "optimistic", "confident", "driven"]',
  'Emotionally bold and direct, connects through shared experiences and thrives on excitement. Values freedom and new experiences, builds connections through exploration and genuine curiosity. Emotionally resilient with clear sense of direction, approaches relationships with confidence and clarity.',
  true
);

-- User 3: Tech Minimalist
INSERT INTO user_profiles (id, email, personality_traits, personality_summary, onboarded)
VALUES (
  'fcb80e3f-0c85-411a-bae1-ed0ba7e7bdfe',
  'minimal.tech@test.com',
  '["modern", "focused", "analytical", "private", "selective", "organized", "intentional", "calm", "rational", "disciplined", "intellectual", "curious", "patient", "introspective", "solitary"]',
  'Values clarity and efficiency in communication, emotionally reserved but deeply loyal once connected. Approaches connections thoughtfully and deliberately, values quality over quantity in relationships. Emotionally measured and thoughtful, builds connections through intellectual and emotional depth.',
  true
);

-- Verify inserts
SELECT id, email, onboarded, array_length(personality_traits, 1) as trait_count
FROM user_profiles
WHERE email IN ('artist.creative@test.com', 'explorer.wild@test.com', 'minimal.tech@test.com');
