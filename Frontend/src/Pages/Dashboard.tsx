import axios from "axios";
import { useEffect, useState } from "react";

const Dashboard = () => {
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await axios.get("http://localhost:3000/user/repos", {
                    withCredentials: true,
                });
                
                console.log("Fetched repositories:", response.data);
                setRepos(response.data);
            } catch (err) {
                console.error("Error fetching repositories:", err);
            }
        };
        

        fetchRepos();
    }, []);

    return (
        <div>
            <h1>Your Repositories:</h1>
            {repos.length === 0 ? (
                <p>No repositories found.</p>
            ) : (
                <ul>
                    {repos.map((repo) => (
                        //@ts-ignore
                        <li key={repo.id}>{repo.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dashboard;
