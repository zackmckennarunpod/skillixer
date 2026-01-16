/**
 * GitHub Search for Skills
 *
 * Searches GitHub for SKILL.md files and repositories
 */

import type { Skill } from "./tui-state";

interface GitHubSearchResult {
  name: string;
  path: string;
  repository: {
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
  };
  html_url: string;
}

interface GitHubCodeSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchResult[];
}

interface GitHubRepoSearchResponse {
  total_count: number;
  items: Array<{
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
  }>;
}

/**
 * Search GitHub for SKILL.md files
 */
export async function searchGitHubSkills(query: string): Promise<Skill[]> {
  try {
    // Search for SKILL.md files containing the query
    const searchQuery = `filename:SKILL.md ${query}`;
    const url = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=10`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Skillixer-TUI",
      },
    });

    if (!response.ok) {
      // If code search fails (rate limit, auth required), fall back to repo search
      return searchGitHubRepos(query);
    }

    const data = (await response.json()) as GitHubCodeSearchResponse;

    return data.items.map((item, i) => ({
      id: `gh-${Date.now()}-${i}`,
      name: item.repository.full_name.split("/")[1] || item.name,
      description:
        item.repository.description || `From ${item.repository.full_name}`,
      path: item.html_url,
      source: "github" as const,
    }));
  } catch (error) {
    console.error("GitHub search error:", error);
    return searchGitHubRepos(query);
  }
}

/**
 * Fallback: Search GitHub repositories for skill-related repos
 */
async function searchGitHubRepos(query: string): Promise<Skill[]> {
  try {
    const searchQuery = `${query} skill OR agent OR claude in:name,description`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&per_page=10`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Skillixer-TUI",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = (await response.json()) as GitHubRepoSearchResponse;

    return data.items.map((repo, i) => ({
      id: `gh-${Date.now()}-${i}`,
      name: repo.full_name.split("/")[1] || repo.full_name,
      description:
        repo.description || `★${repo.stargazers_count} - ${repo.full_name}`,
      path: repo.html_url,
      source: "github" as const,
    }));
  } catch (error) {
    console.error("GitHub repo search error:", error);
    return [];
  }
}

/**
 * Search using gh CLI (more reliable, uses auth)
 */
export async function searchWithGhCli(query: string): Promise<Skill[]> {
  try {
    const proc = Bun.spawn(
      [
        "gh",
        "search",
        "repos",
        query,
        "--limit",
        "10",
        "--json",
        "fullName,description,url,stargazersCount",
      ],
      { stdout: "pipe", stderr: "pipe" },
    );

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      // gh CLI not available or not authenticated, fall back to API
      return searchGitHubSkills(query);
    }

    const repos = JSON.parse(output) as Array<{
      fullName: string;
      description: string | null;
      url: string;
      stargazersCount: number;
    }>;

    return repos.map((repo, i) => ({
      id: `gh-${Date.now()}-${i}`,
      name: repo.fullName.split("/")[1] || repo.fullName,
      description: repo.description || `★${repo.stargazersCount}`,
      path: repo.url,
      source: "github" as const,
    }));
  } catch {
    return searchGitHubSkills(query);
  }
}

/**
 * Main search function - tries gh CLI first, then API
 */
export async function searchGitHub(query: string): Promise<Skill[]> {
  if (!query.trim()) return [];

  // Try gh CLI first (better auth handling)
  const results = await searchWithGhCli(query);

  if (results.length > 0) {
    return results;
  }

  // Fall back to direct API
  return searchGitHubSkills(query);
}
