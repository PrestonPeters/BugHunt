function DeleteUser({username, refresh }) {
    async function deleteLikes(username) {
        const response = await fetch("http://localhost:8080/deleteLikes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username })
        });
        if (!response.ok) {
            console.log("Unexpected server error during like deletion.");
            return Promise.reject("Unexpected server error during like deletion.");
        }
    }

    async function deletePosts(username) {
        const response = await fetch("http://localhost:8080/deleteUserPosts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username })
        });
        if (!response.ok) {
            console.log("Unexpected server error during post deletion.");
            return Promise.reject("Unexpected server error during post deletion.");
        }
    }

    async function deleteUser(username) {
        const response = await fetch("http://localhost:8080/deleteUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username })
        });
        if (!response.ok) {
            console.log("Unexpected server error during user deletion.");
            return Promise.reject("Unexpected server error during user deletion.");
        }
    }

    async function deleteAccount(username) {
        await deleteLikes(username);
        await deletePosts(username);
        await deleteUser(username);
        refresh();
    }

    if (username !== "admin") deleteAccount(username);
}

export default DeleteUser;