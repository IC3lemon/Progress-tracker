import axios from "axios";
let API_BASE = "http://127.0.0.1:3000"; // Default backend URL
export const setApiBaseUrl = (url: string) => {
  API_BASE = url;
};



axios.defaults.withCredentials = true; // Ensure cookies are sent

//const getAuthToken = () => localStorage.getItem("token");

// const getAuthHeaders = () => ({
//   headers: {
//     Authorization: `Bearer ${getAuthToken()}`,  // Send token in headers
//   },
// });

export const fetchRepositories = async () => {
  try {
    // Check if cookies are accessible
    console.log("Stored cookies:", document.cookie);

    const response = await fetch(`${API_BASE}/user/repos`, {
      method: "GET",
      credentials: "include", // Ensures cookies are sent
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("Data is:", data);
    return data;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    throw error;
  }
};

export const fetchUserDetails = async () => {
  try {
    console.log("Stored cookies:", document.cookie);

    const response = await fetch(`${API_BASE}/user/details`, {
      method: "GET",
      credentials: "include", // Ensures cookies are sent
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("User details:", data);
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};








// export const logout = async () => {
//   try {
//     await axios.get(`${API_BASE}/logout`, getAuthHeaders());
//     localStorage.removeItem("token"); // Remove token after logout
//     window.location.href = "/login";
//   } catch (error) {
//     console.error("Logout failed:", error.response?.data || error);
//   }
// };
