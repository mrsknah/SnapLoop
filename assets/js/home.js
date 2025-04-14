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
  
      data.forEach((post) => {
        const postCard = document.createElement("div");
        postCard.className = "post-card";
  
        postCard.innerHTML = `
          <div class="post-header">
            <img src="${post.user.profilePhoto}" alt="User" class="post-avatar" />
            <div>
              <strong>${post.user.fullName}</strong>
              <span>@${post.user.username}</span>
            </div>
          </div>
          <img src="${post.imageUrl}" alt="Post image" class="post-image" />
          <div class="post-caption">
            <p><strong>@${post.user.username}</strong> ${post.caption}</p>
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
  
  if (window.location.pathname.includes("home.html")) {
    loadHomeFeed();
  }
  