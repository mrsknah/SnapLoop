async function loadHomeFeed() {
    try {
      const res = await fetch("http://<YOUR_BACKEND_IP>/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      const feedContainer = document.querySelector(".main-feed");
      feedContainer.innerHTML = ""; // Kosongkan dulu konten awal
  
      const loggedInUsername = localStorage.getItem("username"); // Ambil username yang lagi login
  
      data.forEach((post) => {
        const postCard = document.createElement("div");
        postCard.className = "post-card";
  
        const isOwnPost = post.user.username === loggedInUsername;
        const profileLink = isOwnPost ? "profile.html" : `user.html?username=${post.user.username}`;
  
        postCard.innerHTML = `
          <div class="post-header">
            <img src="${post.user.profilePhoto}" alt="User" class="post-avatar" />
            <div>
              <strong>${post.user.fullName}</strong>
              <a href="${profileLink}" class="user-link">@${post.user.username}</a>
            </div>
          </div>
          <img src="${post.imageUrl}" alt="Post image" class="post-image" />
          <div class="post-caption">
            <p>
              <strong>
                <a href="${profileLink}" class="user-link">@${post.user.username}</a>
              </strong> ${post.caption}
            </p>
          </div>
          <div class="post-actions">
            <button class="post-action-btn like-btn">👍Like</button>
            <button class="post-action-btn comment-btn">💬Comment</button>
            <button class="post-action-btn share-btn">🔗Share</button>
          </div>
        `;
  
        feedContainer.appendChild(postCard);
      });
    } catch (err) {
      console.error("Failed to load home feed:", err);
      alert("Failed to load feed.");
    }
  }
  
  // Pencarian Pengguna
  async function searchUsers(query) {
    if (query.trim() === "") {
      return [];  // Kembali jika query kosong
    }
  
    try {
      const res = await fetch(`http://<YOUR_BACKEND_IP>/search/users?username=${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      return data.users; // Kembalikan array pengguna yang ditemukan
    } catch (err) {
      console.error("Failed to search users:", err);
      alert("Search failed.");
      return [];
    }
  }
  
  // Menampilkan hasil pencarian
  function displaySearchResults(users) {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = ""; // Kosongkan hasil pencarian sebelumnya
  
    if (users.length === 0) {
      resultsContainer.innerHTML = "<p>No users found.</p>";
      resultsContainer.style.display = "block";
      return;
    }
  
    users.forEach(user => {
      const userElement = document.createElement("div");
      userElement.className = "search-result-item";
      userElement.innerHTML = `
        <a href="profile.html?username=${user.username}" class="user-link">
          <img src="${user.profilePhoto}" alt="${user.username}'s avatar" class="user-avatar" />
          <strong>${user.fullName}</strong>
          <span>@${user.username}</span>
        </a>
      `;
      resultsContainer.appendChild(userElement);
    });
  
    resultsContainer.style.display = "block"; // Tampilkan hasil pencarian
  }
  
  // Event listener untuk pencarian
  document.getElementById("search-input").addEventListener("input", async function(event) {
    const query = event.target.value;
    const users = await searchUsers(query);
    displaySearchResults(users);
  });
  
  if (window.location.pathname.includes("home.html")) {
    loadHomeFeed(); // Memuat feed saat pertama kali buka halaman
  }
  