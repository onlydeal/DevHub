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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>();
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const onSubmitPost = async (data: PostFormData) => {
    try {
      await dispatch(createPost({ ...data, tags: data.tags.split(',').map((t) => t.trim()) })).unwrap();
      reset();
      setShowCreatePost(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    
    try {
      await dispatch(addCommentOptimistic({ postId, text })).unwrap();
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!showCreatePost ? (
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full text-left p-4 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition"
          >
            What's on your mind? Share your coding thoughts...
          </button>
        ) : (
          <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4">
            <div>
              <input
                {...register('title', { required: 'Title is required' })}
                placeholder="Post Title"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <textarea
                {...register('content', { required: 'Content is required' })}
                placeholder="Content (Markdown supported)"
                className="w-full border border-gray-300 p-3 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
            
            <input
              {...register('tags')}
              placeholder="Tags (comma-separated)"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
              >
                Create Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreatePost(false);
                  reset();
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      <InfiniteScroll
        dataLength={posts.length}
        next={() => dispatch(fetchFeed(page))}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
        className="space-y-4"
      >
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{post.title}</h3>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="prose max-w-none text-gray-700">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Comments ({post.comments.length})</h4>
              <form
                onSubmit={(e) => onSubmitComment(post._id, e)}
                className="flex space-x-3 mb-4"
              >
                <input
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                  placeholder="Add a comment..."
                  className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Comment
                </button>
              </form>
              
              <div className="space-y-3">
              {post.comments.map((comment) => (
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  onComment={() => {}}
                />
              ))}
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PostFeed;