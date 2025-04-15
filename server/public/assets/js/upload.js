const uploadInput = document.getElementById("upload-post");
if (uploadInput) {
  uploadInput.addEventListener("change", async function () {
    const file = uploadInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("http://<YOUR_BACKEND_IP>/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Photo uploaded!");
        window.location.reload();
      } else {
        alert(data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  });
}
