import React, { useEffect, useState } from 'react';
import API from '../services/api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  useEffect(()=> {
    API.get('/posts').then(res => setPosts(res.data)).catch(console.error);
  }, []);
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {posts.map(p => <PostCard key={p._id} post={p} />)}
      </div>
    </div>
  )
}
