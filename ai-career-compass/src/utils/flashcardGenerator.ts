// Flashcard Generator Utility

interface Flashcard {
  id: string;
  front: string;
  back: string;
  confidence: 'none' | 'hard' | 'medium' | 'easy';
}

interface FlashcardDeck {
  id: string;
  topic: string;
  cards: Flashcard[];
  lastStudied: string;
  createdAt: string;
}

const TOPIC_CARDS: Record<string, { front: string; back: string }[]> = {
  anatomy: [
    { front: 'What is the largest organ in the human body?', back: 'The skin (integumentary system)' },
    { front: 'How many bones are in the adult human body?', back: '206 bones' },
    { front: 'What is the function of the mitochondria?', back: 'It is the powerhouse of the cell, producing ATP through cellular respiration' },
    { front: 'Name the four chambers of the heart', back: 'Right atrium, right ventricle, left atrium, left ventricle' },
    { front: 'What connects muscle to bone?', back: 'Tendons' },
  ],
  programming: [
    { front: 'What is a closure in JavaScript?', back: 'A function that has access to variables in its outer (enclosing) scope, even after the outer function has returned' },
    { front: 'What does REST stand for?', back: 'Representational State Transfer' },
    { front: 'What is the difference between == and === in JavaScript?', back: '== compares values with type coercion, === compares values and types strictly' },
    { front: 'What is Big O notation?', back: 'A mathematical notation describing the limiting behavior of a function, used to classify algorithm complexity' },
    { front: 'What is a Promise?', back: 'An object representing the eventual completion or failure of an asynchronous operation' },
  ],
  business: [
    { front: 'What is ROI?', back: 'Return on Investment – measures the profitability of an investment' },
    { front: 'What are the 4 Ps of Marketing?', back: 'Product, Price, Place, Promotion' },
    { front: 'What is a SWOT analysis?', back: 'Strengths, Weaknesses, Opportunities, Threats – a strategic planning framework' },
    { front: 'What is cash flow?', back: 'The net amount of cash moving in and out of a business' },
    { front: 'What is an MVP?', back: 'Minimum Viable Product – the simplest version of a product that can be released' },
  ],
  psychology: [
    { front: "What is Maslow's Hierarchy of Needs?", back: 'A motivational theory with 5 levels: physiological, safety, love/belonging, esteem, self-actualization' },
    { front: 'What is cognitive dissonance?', back: 'Mental discomfort from holding two contradictory beliefs or values simultaneously' },
    { front: 'What is classical conditioning?', back: 'A learning process where a neutral stimulus becomes associated with a meaningful stimulus (Pavlov)' },
    { front: 'What is the placebo effect?', back: 'A beneficial effect produced by a treatment that cannot be attributed to the treatment itself' },
    { front: 'What is confirmation bias?', back: 'The tendency to search for and favor information that confirms existing beliefs' },
  ],
};

export function generateFlashcards(topic: string): FlashcardDeck {
  const lowerTopic = topic.toLowerCase();
  
  // Find matching topic cards or generate generic ones
  let cards: { front: string; back: string }[] = [];
  
  for (const [key, topicCards] of Object.entries(TOPIC_CARDS)) {
    if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
      cards = topicCards;
      break;
    }
  }

  // Generate generic cards if no match found
  if (cards.length === 0) {
    cards = [
      { front: `What is the definition of ${topic}?`, back: `${topic} is a field of study that encompasses key concepts, theories, and practical applications relevant to the discipline.` },
      { front: `Name 3 key concepts in ${topic}`, back: `1. Foundational theory\n2. Practical applications\n3. Current research and developments` },
      { front: `Who are notable figures in ${topic}?`, back: `Various pioneers and researchers have contributed to ${topic}, establishing core principles used today.` },
      { front: `What skills are needed for ${topic}?`, back: `Critical thinking, research abilities, practical application skills, and continuous learning mindset.` },
      { front: `What career paths relate to ${topic}?`, back: `Professionals in ${topic} can work in research, education, industry applications, and consulting.` },
    ];
  }

  return {
    id: `deck-${Date.now()}`,
    topic,
    cards: cards.map((c, i) => ({
      id: `card-${Date.now()}-${i}`,
      front: c.front,
      back: c.back,
      confidence: 'none' as const,
    })),
    lastStudied: new Date().toLocaleDateString(),
    createdAt: new Date().toLocaleDateString(),
  };
}

export type { Flashcard, FlashcardDeck };
