const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: '', // github token goes here
});

async function fetchUserRepos(username) {
  try {
    const response = await octokit.rest.repos.listForUser({
      username: username,
      type: 'owner', 
      sort: 'updated',
      direction: 'desc',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}

async function fetchUserStars(username) {
  try {
    const response = await octokit.rest.activity.listReposStarredByUser({
      username: username,
      sort: 'created',
      direction: 'desc',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user stars:', error);
    return [];
  }
}

async function fetchUserContributions(username) {
  try {
    const response = await octokit.rest.activity.listEventsForUser({
      username: username,
      per_page: 100, // Adjust as needed
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
}

async function fetchUserDetails(username) {
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

(async () => {
  const username = 'IC3lemon'; // put username here nigga

  const repos = await fetchUserRepos(username);
  console.log('Repositories:', repos);

  const stars = await fetchUserStars(username);
  console.log('Starred Repositories:', stars);

  const contributions = await fetchUserContributions(username);
  console.log('Contributions:', contributions);

  const userDetails = await fetchUserDetails(username);
  console.log('User Details:', userDetails);
})();