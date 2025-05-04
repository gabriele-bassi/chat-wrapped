
// Types for chat analysis
export interface ChatAnalysis {
  totalMessages: number;
  mostUsedWord: { word: string; count: number };
  mostUsedEmoji: { emoji: string; count: number };
  timeOfDayStats: { [key: string]: number };
  dayWithMostMessages: { date: string; count: number };
  averageResponseTime: number; // in seconds
  userStats: {
    [username: string]: {
      messageCount: number;
      wordCount: number;
      emojiCount: number;
    };
  };
}

// Regular expressions for different chat formats
const WHATSAPP_IOS_REGEX = /\[(\d{2}\/\d{2}\/\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}\s*[AP]M)\]\s*([^:]+):\s*(.*)/;
const WHATSAPP_ANDROID_REGEX = /(\d{2}\/\d{2}\/\d{2,4}),\s*(\d{1,2}:\d{2})(?:\s*-\s*)([^:]+):\s*(.*)/;

// Time of day periods
const TIME_PERIODS = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 18 },
  evening: { start: 18, end: 22 },
  night: { start: 22, end: 6 }
};

// Emoji regex
const EMOJI_REGEX = /[\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;

export const analyzeChatFile = (fileContent: string): ChatAnalysis => {
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  // Detect which format we're dealing with
  const format = detectChatFormat(lines[0]);
  if (!format) {
    throw new Error("Formato chat non riconosciuto");
  }
  
  const regex = format === 'ios' ? WHATSAPP_IOS_REGEX : WHATSAPP_ANDROID_REGEX;
  
  // Initialize analysis object
  const analysis: ChatAnalysis = {
    totalMessages: 0,
    mostUsedWord: { word: '', count: 0 },
    mostUsedEmoji: { emoji: '', count: 0 },
    timeOfDayStats: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    dayWithMostMessages: { date: '', count: 0 },
    averageResponseTime: 0,
    userStats: {}
  };

  // Data structures for analysis
  const wordCounts: Record<string, number> = {};
  const emojiCounts: Record<string, number> = {};
  const dayMessageCounts: Record<string, number> = {};
  const userMessages: Record<string, { timestamp: Date, content: string }[]> = {};
  const responseTimes: number[] = [];
  const lastMessageTime: Record<string, Date> = {};
  
  // Process each line
  for (const line of lines) {
    const match = line.match(regex);
    if (!match) continue;
    
    const [, date, time, username, message] = match;
    const cleanUsername = username.trim();
    
    // Parse date and time
    const timestamp = parseDateTime(date, time, format);
    if (!timestamp) continue;
    
    // Initialize user stats if not exists
    if (!analysis.userStats[cleanUsername]) {
      analysis.userStats[cleanUsername] = {
        messageCount: 0,
        wordCount: 0,
        emojiCount: 0
      };
    }
    
    // Add to user messages array
    if (!userMessages[cleanUsername]) {
      userMessages[cleanUsername] = [];
    }
    userMessages[cleanUsername].push({ timestamp, content: message });
    
    // Count total messages
    analysis.totalMessages++;
    analysis.userStats[cleanUsername].messageCount++;
    
    // Count messages per day
    const dayKey = timestamp.toISOString().split('T')[0];
    dayMessageCounts[dayKey] = (dayMessageCounts[dayKey] || 0) + 1;
    
    // Time of day analysis
    const hour = timestamp.getHours();
    if (hour >= TIME_PERIODS.morning.start && hour < TIME_PERIODS.morning.end) {
      analysis.timeOfDayStats.morning++;
    } else if (hour >= TIME_PERIODS.afternoon.start && hour < TIME_PERIODS.afternoon.end) {
      analysis.timeOfDayStats.afternoon++;
    } else if (hour >= TIME_PERIODS.evening.start && hour < TIME_PERIODS.evening.end) {
      analysis.timeOfDayStats.evening++;
    } else {
      analysis.timeOfDayStats.night++;
    }
    
    // Word analysis
    const words = message.toLowerCase().split(/\s+/);
    for (const word of words) {
      // Skip empty strings and words with less than 3 characters (likely prepositions)
      const cleanWord = word.replace(/[^\w\sàèéìòù]/g, '').trim();
      if (cleanWord && cleanWord.length >= 3) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
        analysis.userStats[cleanUsername].wordCount++;
      }
    }
    
    // Emoji analysis
    const emojis = extractEmojis(message);
    for (const emoji of emojis) {
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
      analysis.userStats[cleanUsername].emojiCount++;
    }
    
    // Calculate response time
    const otherUsers = Object.keys(lastMessageTime).filter(user => user !== cleanUsername);
    if (otherUsers.length > 0) {
      const lastOtherUserMessage = Math.max(...otherUsers.map(user => lastMessageTime[user].getTime()));
      const responseTime = (timestamp.getTime() - lastOtherUserMessage) / 1000; // in seconds
      if (responseTime > 0 && responseTime < 86400) { // Ignore responses more than 24 hours
        responseTimes.push(responseTime);
      }
    }
    lastMessageTime[cleanUsername] = timestamp;
  }
  
  // Find most used word
  for (const word in wordCounts) {
    if (wordCounts[word] > analysis.mostUsedWord.count) {
      analysis.mostUsedWord = { word, count: wordCounts[word] };
    }
  }
  
  // Find most used emoji
  for (const emoji in emojiCounts) {
    if (emojiCounts[emoji] > analysis.mostUsedEmoji.count) {
      analysis.mostUsedEmoji = { emoji, count: emojiCounts[emoji] };
    }
  }
  
  // Find day with most messages
  for (const day in dayMessageCounts) {
    if (dayMessageCounts[day] > analysis.dayWithMostMessages.count) {
      analysis.dayWithMostMessages = { date: day, count: dayMessageCounts[day] };
    }
  }
  
  // Calculate average response time
  if (responseTimes.length > 0) {
    const sum = responseTimes.reduce((a, b) => a + b, 0);
    analysis.averageResponseTime = sum / responseTimes.length;
  }
  
  return analysis;
};

// Helper function to detect chat format
function detectChatFormat(line: string): 'ios' | 'android' | null {
  if (WHATSAPP_IOS_REGEX.test(line)) return 'ios';
  if (WHATSAPP_ANDROID_REGEX.test(line)) return 'android';
  return null;
}

// Helper function to parse date and time
function parseDateTime(date: string, time: string, format: 'ios' | 'android'): Date | null {
  try {
    // Handle different date formats
    const [day, month, yearOrDay] = date.split('/');
    let year, month2, day2;
    
    if (yearOrDay.length === 2) {
      // Format: DD/MM/YY
      year = parseInt(yearOrDay) > 80 ? 1900 + parseInt(yearOrDay) : 2000 + parseInt(yearOrDay);
      month2 = parseInt(month) - 1; // JavaScript months are 0-indexed
      day2 = parseInt(day);
    } else if (yearOrDay.length === 4) {
      // Format: DD/MM/YYYY
      year = parseInt(yearOrDay);
      month2 = parseInt(month) - 1;
      day2 = parseInt(day);
    } else {
      return null;
    }
    
    // Handle different time formats
    let hour, minute, second = 0;
    
    if (format === 'ios') {
      // iOS format: 7:49:06 PM
      const timeParts = time.trim().match(/(\d{1,2}):(\d{2}):(\d{2})\s*([AP]M)/i);
      if (!timeParts) return null;
      
      [, hour, minute, second] = timeParts.map(part => parseInt(part) || 0);
      const ampm = timeParts[4].toUpperCase();
      
      // Convert to 24-hour format
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    } else {
      // Android format: 15:20
      const timeParts = time.trim().match(/(\d{1,2}):(\d{2})/);
      if (!timeParts) return null;
      
      [, hour, minute] = timeParts.map(part => parseInt(part) || 0);
    }
    
    return new Date(year, month2, day2, hour, minute, second);
  } catch (error) {
    console.log('Parse date time error:', error);
    return null;
  }
}

// Helper function to extract emojis from text
function extractEmojis(text: string): string[] {
  return Array.from(text.matchAll(EMOJI_REGEX), m => m[0]);
}
