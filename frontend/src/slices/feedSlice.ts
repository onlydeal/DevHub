// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { FeedState, Post } from '../types';

// export const fetchFeed = createAsyncThunk('feed/fetchFeed', async (page: number) => {
//   const res = await axios.get(`/api/posts/feed?page=${page}`);
//   return res.data as { posts: Post[]; hasMore: boolean };
// });

// export const addCommentOptimistic = createAsyncThunk('feed/addComment', async ({ postId, text, parentId }: { postId: string; text: string; parentId?: string }, { dispatch }) => {
//   const tempId = Date.now().toString();
//   dispatch({
//     type: 'feed/addCommentLocal',
//     payload: { postId, text, parentId, tempId }
//   });
//   try {
//     const res = await axios.post('/api/posts/comment', { postId, text, parentId }, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//     return res.data;
//   } catch (err) {
//     dispatch({
//       type: 'feed/rollbackComment',
//       payload: { postId, tempId }
//     });
//     throw err;
//   }
// });

// const feedSlice = createSlice({
//   name: 'feed',
//   initialState: { posts: [], page: 1, hasMore: true } as FeedState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(fetchFeed.fulfilled, (state, action) => {
//       state.posts = [...state.posts, ...action.payload.posts];
//       state.hasMore = action.payload.hasMore;
//       state.page += 1;
//     });
//   },
// });

// export default feedSlice.reducer;



import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { FeedState, Post, Comment } from '../types';
import { addNotification } from './notificationSlice';

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async (page: number, { dispatch }) => {
  try {
    const res = await axios.get(`/api/posts/feed?page=${page}&limit=10`);
    return res.data as { posts: Post[]; hasMore: boolean };
  } catch (err) {
    dispatch(addNotification('Failed to fetch feed'));
    throw err;
  }
});

export const addCommentOptimistic = createAsyncThunk(
  'feed/addComment',
  async ({ postId, text, parentId }: { postId: string; text: string; parentId?: string }, { dispatch, getState }) => {
    const state = getState() as { auth: { user: { id: string } } };
    const tempId = Date.now().toString();
    dispatch({
      type: 'feed/addCommentLocal',
      payload: { postId, text, parentId, tempId, user: state.auth.user.id },
    });
    try {
      const res = await axios.post(
        '/api/posts/comment',
        { postId, text, parentId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      return res.data;
    } catch (err) {
      dispatch({
        type: 'feed/rollbackComment',
        payload: { postId, tempId },
      });
      dispatch(addNotification('Failed to add comment'));
      throw err;
    }
  },
);

export const createPost = createAsyncThunk('feed/createPost', async ({ title, content, tags }: { title: string; content: string; tags: string[] }, { dispatch }) => {
  try {
    const res = await axios.post(
      '/api/posts',
      { title, content, tags },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      },
    );
    return res.data as Post;
  } catch (err) {
    dispatch(addNotification('Failed to create post'));
    throw err;
  }
});

const feedSlice = createSlice({
  name: 'feed',
  initialState: { posts: [], page: 1, hasMore: true } as FeedState,
  reducers: {
    addCommentLocal: (state, action) => {
      const { postId, text, parentId, tempId, user } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        const newComment: Comment = { _id: tempId, text, user, replies: [] };
        if (parentId) {
          const addReply = (comments: Comment[]): boolean => {
            for (let c of comments) {
              if (c._id === parentId) {
                c.replies.push(newComment);
                return true;
              }
              if (addReply(c.replies)) return true;
            }
            return false;
          };
          addReply(post.comments);
        } else {
          post.comments.push(newComment);
        }
      }
    },
    rollbackComment: (state, action) => {
      const { postId, tempId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        const removeComment = (comments: Comment[]): boolean => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === tempId) {
              comments.splice(i, 1);
              return true;
            }
            if (removeComment(comments[i].replies)) return true;
          }
          return false;
        };
        removeComment(post.comments);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFeed.fulfilled, (state, action) => {
      state.posts = [...state.posts, ...action.payload.posts];
      state.hasMore = action.payload.hasMore;
      state.page += 1;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.posts.unshift(action.payload);
    });
    builder.addCase(addCommentOptimistic.fulfilled, (state, action) => {
      // Update with real data if needed
    });
  },
});

export default feedSlice.reducer;