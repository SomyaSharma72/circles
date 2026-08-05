import { User, HelpRequest } from '../types';

export interface RecommendedRequest {
  request: HelpRequest;
  score: number;
  explanation: string;
}

/**
 * Intelligent recommendation engine to score and recommend relevant help requests for a user.
 * Parameters evaluated:
 * - Skills match (+35 to +50)
 * - Profession match (+30 to +40)
 * - Category similarity (+25)
 * - Neighborhood match (+20)
 */
export function getRecommendedRequests(
  user: User | null,
  requests: HelpRequest[],
  limit: number = 3
): RecommendedRequest[] {
  // Filter out requests created by the current user or requests that are completed
  const openRequests = requests.filter((req) => {
    if (user && req.requesterId === user.id) return false;
    if (req.status === 'completed') return false;
    return true;
  });

  if (!user) {
    // If no logged in user, return recent active requests with default explanation
    return openRequests.slice(0, limit).map((req) => ({
      request: req,
      score: 10,
      explanation: 'Popular in your local neighborhood community',
    }));
  }

  const userSkillsLower = (user.skills || []).map((s) => s.toLowerCase());
  const userProfessionLower = (user.profession || '').toLowerCase();
  const userNeighborhoodLower = (user.neighborhood || '').toLowerCase();

  const scored: RecommendedRequest[] = openRequests.map((req) => {
    let score = 0;
    const reasons: string[] = [];

    const titleLower = req.title.toLowerCase();
    const catLower = req.category.toLowerCase();
    const descLower = req.description.toLowerCase();
    const reqNeighborhoodLower = (req.neighborhood || '').toLowerCase();

    // 1. Skill Match
    const matchedSkill = (user.skills || []).find((skill) => {
      const sLower = skill.toLowerCase();
      return (
        catLower.includes(sLower) ||
        sLower.includes(catLower) ||
        titleLower.includes(sLower) ||
        descLower.includes(sLower)
      );
    });

    if (matchedSkill) {
      score += 45;
      reasons.push(`your skills include ${matchedSkill}`);
    }

    // 2. Profession Match
    if (userProfessionLower) {
      const profWords = userProfessionLower.split(/[\s&,/]+/).filter((w) => w.length > 2);
      const matchedWord = profWords.find((w) => {
        return titleLower.includes(w) || catLower.includes(w) || descLower.includes(w);
      });

      if (matchedWord) {
        score += 35;
        if (!reasons.some((r) => r.includes(matchedWord))) {
          reasons.push(`your profession in ${user.profession}`);
        }
      }
    }

    // 3. Category Similarity with user skills / interest
    if (!matchedSkill && userSkillsLower.some((s) => s === catLower || catLower.includes(s))) {
      score += 25;
      reasons.push(`it matches your area of interest in ${req.category}`);
    }

    // 4. Neighborhood Match
    if (
      userNeighborhoodLower &&
      reqNeighborhoodLower &&
      (userNeighborhoodLower.includes(reqNeighborhoodLower) ||
        reqNeighborhoodLower.includes(userNeighborhoodLower))
    ) {
      score += 20;
      reasons.push('you are in the same neighborhood');
    }

    // Build explanation string
    let explanation = 'Recommended based on recent neighborhood activity';
    if (reasons.length > 0) {
      if (reasons.length === 1) {
        explanation = `Recommended because ${reasons[0]}.`;
      } else {
        explanation = `Recommended because ${reasons[0]} and ${reasons[1]}.`;
      }
    }

    return {
      request: req,
      score,
      explanation,
    };
  });

  // Sort by score descending; fallback to index/recency if scores tied
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
