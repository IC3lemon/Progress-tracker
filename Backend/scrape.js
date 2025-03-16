import { Octokit } from "@octokit/rest";

import dotenv from "dotenv";
dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function fetchUserRepos(username) {
  try {
    const response = await octokit.rest.repos.listForUser({
      username: username,
      type: 'owner', 
      sort: 'updated',
      direction: 'desc',
    });
    console.log(data)
    return response.data;
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}


export async function fetchUserDetails(username) {
  try {
    const response = await octokit.rest.users.getByUsername({
      username: username,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}



export async function fetchUserCommits(username) { // yeh commit match karega
  try {
    const response = await octokit.rest.search.commits({
      q: `author:${username}`,
      per_page: 100,
    });

    return response.data.items.map(commit => ({
      message: commit.commit.message,
      repo: commit.repository.full_name,
      url: commit.html_url,
      date: commit.commit.author.date,
    }));
  } catch (error) {
    console.error("Error fetching user commits:", error);
    return [];
  }
}

