// Ambil username dari URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

// Fungsi untuk menampilkan profil pengguna berdasarkan username
async function loadUserProfile(username) {
  try {
    const res = await fetch(`http://<YOUR_BACKEND_IP>/users/${username}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.querySelector(".profile-info h2").textContent = data.fullName;
    document.querySelector(".profile-info p1").textContent = `@${data.username}`;
    document.querySelector(".profile-info p").textContent = data.bio || "📸 New to SnapLoop!";
    document.querySelector(".avatar").src = data.profilePhoto;
    
    // Tampilkan postingan
    const postsGrid = document.querySelector(".posts-grid");
    postsGrid.innerHTML = "";
    data.posts.forEach(post => {
      const img = document.createElement("img");
      img.src = post.imageUrl;
      img.alt = "Post";
      img.className = "post-image";

      const captionElement = document.createElement("p");
      captionElement.textContent = post.caption;

      const wrapper = document.createElement("div");
      wrapper.className = "post-item";
      wrapper.appendChild(img);
      wrapper.appendChild(captionElement);

      postsGrid.appendChild(wrapper);
    });

  } catch (err) {
    console.error("Failed to load user profile:", err);
    alert("Failed to load user profile.");
  }
}

// Panggil fungsi loadUserProfile ketika halaman user.html dimuat
if (username) {
  loadUserProfile(username);
}
