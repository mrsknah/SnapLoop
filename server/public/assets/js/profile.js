document.getElementById("upload-post").addEventListener("change", handleFileSelect);

// Cek apakah token ada di localStorage
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first.");
  window.location.href = "login.html"; // Arahkan ke halaman login jika token tidak ada
}

async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Menampilkan input caption
    document.getElementById("caption-section").style.display = "block";
    
    // Menangani posting ketika tombol post diklik
    document.getElementById("post-button").addEventListener("click", async function() {
      const caption = document.getElementById("caption-input").value;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);

      // Kirim data ke backend (ubah URL sesuai dengan backendmu)
      try {
        const res = await fetch("http://<YOUR_BACKEND_IP>/posts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Menambahkan foto dan caption ke halaman profil
        const postsGrid = document.querySelector(".posts-grid");
        const img = document.createElement("img");
        img.src = data.imageUrl;  // Ganti dengan URL gambar yang diupload
        img.alt = "Post";
        img.className = "post-image";

        const captionElement = document.createElement("p");
        captionElement.textContent = data.caption;

        const wrapper = document.createElement("div");
        wrapper.className = "post-item";
        wrapper.appendChild(img);
        wrapper.appendChild(captionElement);

        postsGrid.appendChild(wrapper);
        
        // Update statistik posts
        const postsCount = document.querySelector(".stat-item .stat-number");
        postsCount.textContent = parseInt(postsCount.textContent) + 1;

        // Reset form
        document.getElementById("caption-section").style.display = "none";
        document.getElementById("caption-input").value = "";
        document.getElementById("upload-post").value = "";  // Reset file input
      } catch (err) {
        console.error(err);
        alert("Failed to upload post.");
      }
    });
  }
}

async function loadProfile() {
  try {
    const res = await fetch("http://<YOUR_BACKEND_IP>/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.querySelector(".profile-info h2").textContent = data.fullName;
    document.querySelector(".profile-info p1").textContent = "@" + data.username;
    document.querySelector(".profile-info p").textContent = data.bio || "📸 New to SnapLoop!";
    document.querySelector(".avatar").src = data.profilePhoto;

    // load posts if available
    const postsGrid = document.querySelector(".posts-grid");
    if (data.posts.length > 0 && postsGrid) {
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

      document.querySelector(".no-posts")?.remove();
      postsGrid.style.display = "grid";
    }
  } catch (err) {
    console.error(err);
    alert("Failed to load profile.");
  }
}

if (window.location.pathname.includes("profile.html")) {
  loadProfile();
}

// Show edit profile modal
document.getElementById("edit-profile-btn").addEventListener("click", () => {
    document.getElementById("edit-profile-modal").style.display = "flex";
  });
  
  // Cancel edit
  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    document.getElementById("edit-profile-modal").style.display = "none";
  });
  
  // Save edit profile
  document.getElementById("save-profile-btn").addEventListener("click", async () => {
    const fullName = document.getElementById("edit-fullname").value;
    const bio = document.getElementById("edit-bio").value;
    const file = document.getElementById("edit-photo").files[0];
  
    const formData = new FormData();
    if (fullName) formData.append("fullName", fullName);
    if (bio) formData.append("bio", bio);
    if (file) formData.append("profilePhoto", file);
  
    try {
      const res = await fetch("http://<YOUR_BACKEND_IP>/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      alert("Profile updated!");
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  });

// Logout Button Functionality
const logoutButton = document.getElementById('logout-btn');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "login.html";  // Redirect to login page
  });
}
