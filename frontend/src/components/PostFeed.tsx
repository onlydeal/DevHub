// import React, { useEffect } from 'react';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../store';
// import { fetchFeed } from '../slices/feedSlice';
// import CommentThread from './CommentThread';

// const PostFeed: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { posts, hasMore, page } = useSelector((state: RootState) => state.feed);

//   useEffect(() => {
//     dispatch(fetchFeed(1));
//   }, [dispatch]);

//   return (
//     <div className="w-full max-w-4xl mx-auto">
//       <InfiniteScroll
//         dataLength={posts.length}
//         next={() => dispatch(fetchFeed(page))}
//         hasMore={hasMore}
//         loader={<h4 className="text-center">Loading...</h4>}
//         className="space-y-4"
//       >
//         {posts.map((post) => (
//           <div key={post._id} className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-xl font-bold mb-2">{post.title}</h3>
//             <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
//             <div className="mt-4">
//               <h4 className="text-lg font-semibold">Comments</h4>
//               {post.comments.map((comment) => <CommentThread key={comment._id} comment={comment} />)}
//             </div>
//           </div>
//         ))}
//       </InfiniteScroll>
//     </div>
//   );
// };

// export default PostFeed;



import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchFeed, createPost, addCommentOptimistic } from '../slices/feedSlice';
import { useForm } from 'react-hook-form';
import CommentThread from './CommentThread';
import ReactMarkdown from 'react-markdown';

interface PostFormData {
  title: string;
  content: string;
  tags: string;
}

const PostFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, hasMore, page } = useSelector((state: RootState) => state.feed);
  const { register, handleSubmit, reset } = useForm<PostFormData>();
  const [commentData, setCommentData] = useState<{ postId: string; text: string; parentId?: string }>({ postId: '', text: '' });

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const onSubmitPost = async (data: PostFormData) => {
    try {
      await dispatch(createPost({ ...data, tags: data.tags.split(',').map((t) => t.trim()) })).unwrap();
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitComment = async (postId: string) => {
    if (!commentData.text) return;
    try {
      await dispatch(addCommentOptimistic({ ...commentData, postId })).unwrap();
      setCommentData({ postId: '', text: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmitPost)} className="bg-white p-6 rounded-lg shadow-md">
        <input
          {...register('title', { required: true })}
          placeholder="Post Title"
          className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          {...register('content', { required: true })}
          placeholder="Content (Markdown supported)"
          className="w-full border p-2 rounded mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          {...register('tags')}
          placeholder="Tags (comma-separated)"
          className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Create Post
        </button>
      </form>
      <InfiniteScroll
        dataLength={posts.length}
        next={() => dispatch(fetchFeed(page))}
        hasMore={hasMore}
        loader={<h4 className="text-center text-gray-500">Loading...</h4>}
        className="space-y-4"
      >
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <ReactMarkdown className="prose max-w-none">{post.content}</ReactMarkdown>
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Comments</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitComment(post._id);
                }}
                className="flex space-x-2 mt-2"
              >
                <input
                  value={commentData.text}
                  onChange={(e) => setCommentData({ ...commentData, postId: post._id, text: e.target.value })}
                  placeholder="Add a comment..."
                  className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                  Comment
                </button>
              </form>
              {post.comments.map((comment) => (
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  onComment={(data) => setCommentData(data)}
                />
              ))}
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PostFeed;