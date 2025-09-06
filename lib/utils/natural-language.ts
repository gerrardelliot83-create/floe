import { addDays, addWeeks, addMonths, setHours, setMinutes, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday } from 'date-fns';

interface ParsedTask {
  title: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: Date;
  tags?: string[];
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}

export function parseNaturalLanguage(input: string): ParsedTask {
  let title = input;
  let priority: ParsedTask['priority'] = undefined;
  let dueDate: Date | undefined = undefined;
  let tags: string[] = [];
  let recurring: ParsedTask['recurring'] = undefined;

  // Extract tags (words starting with #)
  const tagRegex = /#(\w+)/g;
  const tagMatches = input.match(tagRegex);
  if (tagMatches) {
    tags = tagMatches.map(tag => tag.substring(1));
    title = title.replace(tagRegex, '').trim();
  }

  // Extract priority
  const priorityRegex = /\b(high|medium|low)\s*priority\b/i;
  const priorityMatch = title.match(priorityRegex);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as ParsedTask['priority'];
    title = title.replace(priorityRegex, '').trim();
  }

  // Extract recurring patterns
  const recurringRegex = /\bevery\s+(day|daily|week|weekly|month|monthly|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const recurringMatch = title.match(recurringRegex);
  if (recurringMatch) {
    const pattern = recurringMatch[1].toLowerCase();
    
    if (pattern === 'day' || pattern === 'daily') {
      recurring = { pattern: 'daily', interval: 1 };
    } else if (pattern === 'week' || pattern === 'weekly') {
      recurring = { pattern: 'weekly', interval: 1 };
    } else if (pattern === 'month' || pattern === 'monthly') {
      recurring = { pattern: 'monthly', interval: 1 };
    } else {
      // Specific day of week - set as weekly recurring
      recurring = { pattern: 'weekly', interval: 1 };
      // Set due date to next occurrence of that day
      const dayFunctions: { [key: string]: (date: Date) => Date } = {
        monday: nextMonday,
        tuesday: nextTuesday,
        wednesday: nextWednesday,
        thursday: nextThursday,
        friday: nextFriday,
        saturday: nextSaturday,
        sunday: nextSunday,
      };
      if (dayFunctions[pattern]) {
        dueDate = dayFunctions[pattern](new Date());
      }
    }
    
    title = title.replace(recurringRegex, '').trim();
  }

  // Extract date and time
  const now = new Date();
  
  // Time patterns
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/gi;
  const timeMatches = [...title.matchAll(timeRegex)];
  
  // Date patterns
  const patterns = [
    { regex: /\btoday\b/i, getDate: () => now },
    { regex: /\btomorrow\b/i, getDate: () => addDays(now, 1) },
    { regex: /\bnext\s+week\b/i, getDate: () => addWeeks(now, 1) },
    { regex: /\bnext\s+month\b/i, getDate: () => addMonths(now, 1) },
    { regex: /\bin\s+(\d+)\s+days?\b/i, getDate: (match: RegExpMatchArray) => addDays(now, parseInt(match[1])) },
    { regex: /\bin\s+(\d+)\s+weeks?\b/i, getDate: (match: RegExpMatchArray) => addWeeks(now, parseInt(match[1])) },
    { regex: /\bin\s+(\d+)\s+months?\b/i, getDate: (match: RegExpMatchArray) => addMonths(now, parseInt(match[1])) },
    { regex: /\bon\s+monday\b/i, getDate: () => nextMonday(now) },
    { regex: /\bon\s+tuesday\b/i, getDate: () => nextTuesday(now) },
    { regex: /\bon\s+wednesday\b/i, getDate: () => nextWednesday(now) },
    { regex: /\bon\s+thursday\b/i, getDate: () => nextThursday(now) },
    { regex: /\bon\s+friday\b/i, getDate: () => nextFriday(now) },
    { regex: /\bon\s+saturday\b/i, getDate: () => nextSaturday(now) },
    { regex: /\bon\s+sunday\b/i, getDate: () => nextSunday(now) },
    { regex: /\bmonday\b/i, getDate: () => nextMonday(now) },
    { regex: /\btuesday\b/i, getDate: () => nextTuesday(now) },
    { regex: /\bwednesday\b/i, getDate: () => nextWednesday(now) },
    { regex: /\bthursday\b/i, getDate: () => nextThursday(now) },
    { regex: /\bfriday\b/i, getDate: () => nextFriday(now) },
    { regex: /\bsaturday\b/i, getDate: () => nextSaturday(now) },
    { regex: /\bsunday\b/i, getDate: () => nextSunday(now) },
  ];

  // Try to find a date pattern
  for (const pattern of patterns) {
    const match = title.match(pattern.regex);
    if (match) {
      dueDate = pattern.getDate(match);
      title = title.replace(pattern.regex, '').trim();
      break;
    }
  }

  // If we found a time, apply it to the date
  if (timeMatches.length > 0 && dueDate) {
    const timeMatch = timeMatches[0];
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2] || '0');
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hours < 12) {
      hours += 12;
    } else if (ampm === 'am' && hours === 12) {
      hours = 0;
    }
    
    dueDate = setHours(setMinutes(dueDate, minutes), hours);
    
    // Remove time from title
    title = title.replace(timeMatch[0], '').trim();
  }

  // Remove common words
  const removeWords = ['at', 'on', 'in', 'by', 'due', 'deadline'];
  const wordRegex = new RegExp(`\\b(${removeWords.join('|')})\\b`, 'gi');
  title = title.replace(wordRegex, '').trim();

  // Clean up extra spaces
  title = title.replace(/\s+/g, ' ').trim();

  return {
    title,
    priority,
    dueDate,
    tags,
    ...(recurring && { recurring }),
  };
}

// Examples of usage:
// "Call John tomorrow at 2pm" -> { title: "Call John", dueDate: tomorrow at 2pm }
// "Review PR high priority #dev" -> { title: "Review PR", priority: "high", tags: ["dev"] }
// "Weekly team meeting every Monday at 10am" -> { title: "team meeting", recurring: weekly, dueDate: next Monday 10am }
// "Submit report by Friday #work high priority" -> { title: "Submit report", priority: "high", tags: ["work"], dueDate: Friday }