import React from 'react';
export default function PostCard({post}) {
  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-xl font-semibold">{post.title}</h3>
      <p className="text-sm text-gray-600">by {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}</p>
      <p className="mt-2 line-clamp-3">{post.content}</p>
      <a className="text-indigo-600 mt-2 inline-block" href={`/posts/${post._id}`}>Read →</a>
    </div>
  )
}
