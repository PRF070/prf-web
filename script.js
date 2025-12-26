async function loadPosts() {
	const { data, error } = await _supabase
		.from('Posts')
		.select('*')
		.order('created_at', { ascending: false });
	
	if (error) {
		console.error("Error loading posts:", error.message);
		return;
	}
	
	const feed = document.getElementById("posts");
	feed.innerHTML = "";
	
	data.forEach(post => {
		const postElement = document.createElement("div");
		postElement.className = "post-card";
		
		// Check for Image or Video content
		let mediaHtml = '';
		if (post.image_url) {
			mediaHtml = `<img src="${post.image_url}" alt="Post Image" style="width:100%; border-radius:10px;">`;
		} else if (post.video_url) {
			mediaHtml = `<video src="${post.video_url}" controls style="width:100%; border-radius:10px;"></video>`;
		}
		
		postElement.innerHTML = `
            ${mediaHtml}
            <p style="background: ${post.bg || '#fff'}; padding: 10px; border-radius: 5px; margin-top: 10px;">
                ${post.text}
            </p>
            <small>${new Date(post.created_at).toLocaleDateString()}</small>
        `;
		feed.appendChild(postElement);
	});
}

loadPosts();


let img = document.querySelectorAll('img');
img.forEach(img => {img.setAttribute("loading", "lazy")})
