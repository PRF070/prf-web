/**
 * Helper to show/hide the custom dialog modal
 * @param {string} type - 'message' for success/info or 'uploading' for the animation
 * @param {string} text - The message to display
 */
function showModal(type, text = "") {
	const modal = document.querySelector(".dialog_modal");
	const messageBox = document.querySelector(".message_box");
	const uploadAnim = document.querySelector(".upload_animations");
	const messageText = document.querySelector(".message");
	
	modal.style.display = "grid";
	
	if (type === "uploading") {
		messageBox.style.display = "none";
		uploadAnim.style.display = "flex";
	} else {
		uploadAnim.style.display = "flex"; // Hide upload
		uploadAnim.style.display = "none";
		messageBox.style.display = "flex";
		messageText.innerText = text;
		
		// Auto-close after 2.5 seconds for success messages
		setTimeout(hideModal, 2500);
	}
}

function hideModal() {
	document.querySelector(".dialog_modal").style.display = "none";
}

// 1. Handle Login
async function login() {
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	
	if (!email || !password) {
		alert("Please fill in all fields."); // Keeping standard alert only for empty inputs
		return;
	}
	
	const { data, error } = await _supabase.auth.signInWithPassword({
		email: email,
		password: password,
	});
	
	if (error) {
		showModal("message", "Access Denied: " + error.message);
	} else {
		showModal("message", "Welcome, Admin! 👋");
		document.getElementById("dashboard").style.display = "block";
		document.querySelector(".admin").style.display = "none";
		loadAdminPosts();
	}
}

// 2. Handle Logout
async function logout() {
	const { error } = await _supabase.auth.signOut();
	
	if (error) {
		showModal("message", "Error logging out: " + error.message);
	} else {
		showModal("message", "Logged out successfully!");
		// UI Reset
		document.getElementById("dashboard").style.display = "none";
		document.querySelector(".admin").style.display = "block";
		// Clear inputs
		document.getElementById("email").value = "";
		document.getElementById("password").value = "";
	}
}

// 3. Handle Posting (with Animations)
async function addPost() {
	const text = document.getElementById("postText").value;
	const bgColor = document.getElementById("bgColor").value;
	const imageFile = document.getElementById("postImage").files[0];
	const videoFile = document.getElementById("postVideo").files[0];
	
	const { data: { user } } = await _supabase.auth.getUser();
	if (!user) {
		showModal("message", "Session expired. Please login again.");
		return;
	}
	
	showModal("uploading");
	
	try {
		let imageUrl = null;
		let videoUrl = null;
		
		if (imageFile) {
			const fileName = `images/${Date.now()}_${imageFile.name}`;
			await _supabase.storage.from('uploads').upload(fileName, imageFile);
			const { data } = _supabase.storage.from('uploads').getPublicUrl(fileName);
			imageUrl = data.publicUrl;
		}
		
		if (videoFile) {
			const fileName = `videos/${Date.now()}_${videoFile.name}`;
			await _supabase.storage.from('uploads').upload(fileName, videoFile);
			const { data } = _supabase.storage.from('uploads').getPublicUrl(fileName);
			videoUrl = data.publicUrl;
		}
		
		const { error: postError } = await _supabase.from('Posts').insert([{
			text: text,
			bg: bgColor,
			image_url: imageUrl,
			video_url: videoUrl,
			user_id: user.id,
			created_at: new Date()
		}]);
		
		if (postError) throw postError;
		
		showModal("message", "Post is LIVE! 🚀");
		
		// Reset form
		document.getElementById("postText").value = "";
		document.getElementById("postImage").value = "";
		document.getElementById("postVideo").value = "";
		
		// Refresh the list without reloading the whole page (cleaner!)
		loadAdminPosts();
		
	} catch (err) {
		showModal("message", "Error: " + err.message);
	}
}

// 4. Handle Delete
async function deletePost(postId) {
	if (confirm("Delete this post forever?")) {
		const { error } = await _supabase
			.from('Posts')
			.delete()
			.eq('id', postId);
		
		if (error) {
			showModal("message", "Delete failed: " + error.message);
		} else {
			showModal("message", "Post deleted! 🗑️");
			loadAdminPosts(); // Refresh list
		}
	}
}

// 5. Load Posts in Admin Dashboard
async function loadAdminPosts() {
	const { data, error } = await _supabase
		.from('Posts')
		.select('*')
		.order('created_at', { ascending: false });
	
	const dashboard = document.getElementById("dashboard");
	
	// Remove old list if it exists to prevent duplicates
	const oldList = document.querySelector(".admin_post_list");
	if (oldList) oldList.remove();
	
	if (data) {
		const listDiv = document.createElement("div");
		listDiv.className = "admin_post_list";
		listDiv.style.marginTop = "20px";
		
		data.forEach(post => {
			const item = document.createElement("div");
			item.style.padding = "15px";
			item.style.border = "1px solid #ddd";
			item.style.borderRadius = "8px";
			item.style.marginBottom = "10px";
			item.style.background = "#fff";
			
			item.innerHTML = `
                <p><strong>Text:</strong> ${post.text || "(No text)"}</p>
                ${post.image_url ? `<img src="${post.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">` : ""}
                <br>
                <button onclick="deletePost(${post.id})" style="background:#ff4d4d; color:white; padding: 5px 10px; cursor:pointer;">
                    🗑️ Delete
                </button>
            `;
			listDiv.appendChild(item);
		});
		dashboard.appendChild(listDiv);
	}
}