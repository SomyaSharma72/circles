import { GoogleGenAI, Type } from '@google/genai';

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY environment variable is missing.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * AI Categorization & Auto-tagging
 */
export async function categorizeRequest(title: string, description: string) {
  const ai = getAIClient();
  if (!ai) {
    return {
      category: 'General Help',
      urgency: 'Medium',
      tags: ['neighbor-help'],
      summary: description.slice(0, 100),
      isSpam: false,
      fraudReason: '',
    };
  }

  try {
    const prompt = `Analyze this community favor request and return JSON with category, urgency, tags, 2-line summary, and spam detection.
Title: "${title}"
Description: "${description}"

Categories available: "Home Repair", "Gardening", "Pet Care", "Grocery/Errands", "Tech Help", "Transportation", "Tutoring", "Moving/Lifting", "General Help".
Urgency levels: "Low", "Medium", "High", "Emergency".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            urgency: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            isSpam: { type: Type.BOOLEAN },
            fraudReason: { type: Type.STRING },
          },
          required: ['category', 'urgency', 'tags', 'summary', 'isSpam'],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return {
        category: parsed.category || 'General Help',
        urgency: ['Low', 'Medium', 'High', 'Emergency'].includes(parsed.urgency) ? parsed.urgency : 'Medium',
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['community'],
        summary: parsed.summary || description.slice(0, 100),
        isSpam: Boolean(parsed.isSpam),
        fraudReason: parsed.fraudReason || '',
      };
    }
  } catch (err) {
    console.error('AI Categorization error:', err);
  }

  return {
    category: 'General Help',
    urgency: 'Medium',
    tags: ['neighbor-help'],
    summary: description.slice(0, 120),
    isSpam: false,
    fraudReason: '',
  };
}

/**
 * AI Smart Recommendation Engine: Ranks requests based on user skills, profession, history
 */
export async function rankRecommendationsForUser(user: any, openRequests: any[]) {
  if (!openRequests || openRequests.length === 0) return [];
  const ai = getAIClient();
  if (!ai) return openRequests;

  try {
    const userContext = {
      skills: user.skills || [],
      profession: user.profession || '',
      neighborhood: user.neighborhood || '',
      completedFavors: user.completedFavors || 0,
    };

    const requestsContext = openRequests.map((r, index) => ({
      index,
      id: String(r._id),
      title: r.title,
      category: r.category,
      tags: r.tags || [],
      description: r.description,
    }));

    const prompt = `You are the Neighborly Smart Match Engine. Given a neighbor's profile and a list of open neighborhood favor requests, rank the request indices from best match to worst match based on skill alignment, profession, and helpfulness. Return JSON array of sorted indices with match reasons.

Neighbor Profile: ${JSON.stringify(userContext)}
Open Requests: ${JSON.stringify(requestsContext)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              matchScore: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ['index', 'matchScore', 'reason'],
          },
        },
      },
    });

    if (response.text) {
      const rankings = JSON.parse(response.text.trim());
      const rankedList = rankings
        .filter((item: any) => typeof item.index === 'number' && openRequests[item.index])
        .map((item: any) => {
          const reqObj = openRequests[item.index].toObject
            ? openRequests[item.index].toObject()
            : { ...openRequests[item.index] };
          return {
            ...reqObj,
            aiMatchScore: item.matchScore || 80,
            aiMatchReason: item.reason || 'Matches your community skills',
          };
        });

      // Append any unranked requests at the end
      const rankedIndices = new Set(rankings.map((r: any) => r.index));
      openRequests.forEach((req, idx) => {
        if (!rankedIndices.has(idx)) {
          const reqObj = req.toObject ? req.toObject() : { ...req };
          rankedList.push({
            ...reqObj,
            aiMatchScore: 50,
            aiMatchReason: 'Available in your community',
          });
        }
      });

      return rankedList;
    }
  } catch (err) {
    console.error('AI Recommendation error:', err);
  }

  return openRequests;
}

/**
 * AI Natural Language Smart Search
 */
export async function smartSearchRequests(query: string, allRequests: any[]) {
  if (!query || !allRequests || allRequests.length === 0) return allRequests;
  const ai = getAIClient();
  if (!ai) {
    const qLower = query.toLowerCase();
    return allRequests.filter(
      (r) =>
        r.title?.toLowerCase().includes(qLower) ||
        r.description?.toLowerCase().includes(qLower) ||
        r.category?.toLowerCase().includes(qLower) ||
        r.tags?.some((t: string) => t.toLowerCase().includes(qLower))
    );
  }

  try {
    const requestsContext = allRequests.map((r, index) => ({
      index,
      title: r.title,
      category: r.category,
      tags: r.tags || [],
      description: r.description,
    }));

    const prompt = `A user is searching for favor requests with query: "${query}".
Evaluate the list of favor requests and return JSON array of matching request indices along with relevance score (0-100) and brief snippet explanation.

Requests: ${JSON.stringify(requestsContext)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              relevanceScore: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
            },
            required: ['index', 'relevanceScore'],
          },
        },
      },
    });

    if (response.text) {
      const matches = JSON.parse(response.text.trim());
      const filtered = matches
        .filter((m: any) => typeof m.index === 'number' && m.relevanceScore > 30 && allRequests[m.index])
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        .map((m: any) => {
          const reqObj = allRequests[m.index].toObject ? allRequests[m.index].toObject() : { ...allRequests[m.index] };
          return {
            ...reqObj,
            searchRelevance: m.relevanceScore,
            searchExplanation: m.explanation || '',
          };
        });
      return filtered;
    }
  } catch (err) {
    console.error('AI Smart Search error:', err);
  }

  // Fallback keyword search
  const qLower = query.toLowerCase();
  return allRequests.filter(
    (r) =>
      r.title?.toLowerCase().includes(qLower) ||
      r.description?.toLowerCase().includes(qLower) ||
      r.category?.toLowerCase().includes(qLower) ||
      r.tags?.some((t: string) => t.toLowerCase().includes(qLower))
  );
}

/**
 * AI Skill Matching for a specific request: Finds neighbors best suited
 */
export async function matchSkillsForRequest(request: any, availableUsers: any[]) {
  if (!availableUsers || availableUsers.length === 0) return [];
  const ai = getAIClient();
  if (!ai) return [];

  try {
    const usersContext = availableUsers.map((u, index) => ({
      index,
      id: String(u._id),
      name: u.name,
      profession: u.profession,
      skills: u.skills || [],
      trustScore: u.trustScore,
      completedFavors: u.completedFavors,
    }));

    const prompt = `Given this favor request:
Title: "${request.title}"
Category: "${request.category}"
Description: "${request.description}"

Analyze these neighbors and return JSON array of the top matching candidates with match probability percentage and match rationale.
Neighbors: ${JSON.stringify(usersContext)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              matchPercentage: { type: Type.NUMBER },
              rationale: { type: Type.STRING },
            },
            required: ['index', 'matchPercentage', 'rationale'],
          },
        },
      },
    });

    if (response.text) {
      const candidates = JSON.parse(response.text.trim());
      return candidates
        .filter((c: any) => typeof c.index === 'number' && availableUsers[c.index])
        .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)
        .map((c: any) => {
          const userObj = availableUsers[c.index].toObject
            ? availableUsers[c.index].toObject()
            : { ...availableUsers[c.index] };
          return {
            ...userObj,
            matchPercentage: c.matchPercentage,
            rationale: c.rationale,
          };
        });
    }
  } catch (err) {
    console.error('AI Skill Match error:', err);
  }

  return [];
}
