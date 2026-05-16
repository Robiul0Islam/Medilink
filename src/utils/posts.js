const LS_POSTS = "medilink_posts";

export function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(LS_POSTS)) || [];
  } catch {
    return [];
  }
}

export function savePosts(posts) {
  localStorage.setItem(LS_POSTS, JSON.stringify(posts));
}
