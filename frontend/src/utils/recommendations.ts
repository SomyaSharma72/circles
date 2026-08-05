import { User, HelpRequest } from '../types';

export interface RecommendedRequest {
  request: HelpRequest;
  score: number;
  explanation: string;
}

export function getRecommendedRequests(
  user: User | null,
  requests: HelpRequest[],
  limit: number = 3
): RecommendedRequest[] {
  const openRequests = requests.filter((req) => {
    if (user && req.requesterId === user.id) return false;
    if (req.status === 'completed') return false;
    return true;
  });

  if (!user) {
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

    if (userProfessionLower) {
      const profWords = userProfessionLower.split(/[\s&,/]+/).filter((w: string) => w.length > 2);
      const matchedWord = profWords.find((w: string) => {
        return titleLower.includes(w) || catLower.includes(w) || descLower.includes(w);
      });

      if (matchedWord) {
        score += 35;
        if (!reasons.some((r) => r.includes(matchedWord))) {
          reasons.push(`your profession in ${user.profession}`);
        }
      }
    }

    if (!matchedSkill && userSkillsLower.some((s) => s === catLower || catLower.includes(s))) {
      score += 25;
      reasons.push(`it matches your area of interest in ${req.category}`);
    }

    if (
      userNeighborhoodLower &&
      reqNeighborhoodLower &&
      (userNeighborhoodLower.includes(reqNeighborhoodLower) ||
        reqNeighborhoodLower.includes(userNeighborhoodLower))
    ) {
      score += 20;
      reasons.push('you are in the same neighborhood');
    }

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

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
