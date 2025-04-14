document.getElementById("upload-post").addEventListener("change", handleFileSelect);

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
