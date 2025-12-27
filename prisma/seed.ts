import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = [
    { name: 'Technology', description: 'Tech trends and predictions', color: '#3B82F6', icon: '💻' },
    { name: 'Finance', description: 'Market and economic predictions', color: '#10B981', icon: '💰' },
    { name: 'Politics', description: 'Political events and outcomes', color: '#EF4444', icon: '🏛️' },
    { name: 'Sports', description: 'Sports predictions and outcomes', color: '#F59E0B', icon: '⚽' },
    { name: 'Entertainment', description: 'Entertainment industry predictions', color: '#8B5CF6', icon: '🎬' },
    { name: 'Science', description: 'Scientific discoveries and research', color: '#06B6D4', icon: '🔬' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create achievements
  const achievements = [
    {
      name: 'First Signal',
      description: 'Created your first signal',
      icon: '🎯',
      category: 'signals',
      points: 10,
    },
    {
      name: 'Signal Master',
      description: 'Created 100 signals',
      icon: '🏆',
      category: 'signals',
      points: 100,
    },
    {
      name: 'First Conviction',
      description: 'Made your first conviction',
      icon: '💪',
      category: 'convictions',
      points: 5,
    },
    {
      name: 'Conviction Champion',
      description: 'Made 500 convictions',
      icon: '👑',
      category: 'convictions',
      points: 250,
    },
    {
      name: 'Rising Star',
      description: 'Gained 10 followers',
      icon: '⭐',
      category: 'social',
      points: 25,
    },
    {
      name: 'Influencer',
      description: 'Gained 100 followers',
      icon: '🌟',
      category: 'social',
      points: 100,
    },
    {
      name: 'High Credibility',
      description: 'Reached 80+ credibility score',
      icon: '🎖️',
      category: 'reputation',
      points: 50,
    },
    {
      name: 'Streak Master',
      description: 'Maintained a 7-day streak',
      icon: '🔥',
      category: 'engagement',
      points: 30,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  // Create trending topics
  const topics = [
    { name: 'AI Revolution', category: 'Technology', trending: true, momentum: 85.5 },
    { name: 'Crypto Markets', category: 'Finance', trending: true, momentum: 72.3 },
    { name: 'Climate Change', category: 'Science', trending: true, momentum: 68.9 },
    { name: 'Space Exploration', category: 'Science', trending: false, momentum: 45.2 },
    { name: 'Electric Vehicles', category: 'Technology', trending: true, momentum: 78.1 },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });