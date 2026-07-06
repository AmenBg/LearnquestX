import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import listSubjectProgress from "./tools/list-subject-progress";
import listAchievements from "./tools/list-achievements";
import getLeaderboard from "./tools/get-leaderboard";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "learnquest-mcp",
  title: "LearnQuest",
  version: "0.1.0",
  instructions:
    "Tools for LearnQuest — a gamified learning platform. Read the signed-in user's profile, subject progress, unlocked achievements, and the global XP leaderboard.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfile, listSubjectProgress, listAchievements, getLeaderboard],
});
