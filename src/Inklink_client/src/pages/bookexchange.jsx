import React, { useState, useEffect } from 'react';

function BookExchange() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 替換成 FastAPI 端點的實際 URL
    const apiUrl = 'http://127.0.0.1:8000/questions'; 

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setPosts(data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  return (
    <div>
      <h1>二手書交換平台</h1>
      {posts.length > 0 ? (
        <ul>
          {/* {posts.map(post => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </li>
          ))} */}
        </ul>
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
}

export default BookExchange;
