import { Request, Response } from "express";
import Post from "../models/Post";
import Activity from "../models/Activity";
import { marked } from "marked";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, tags } = req.body;
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const parsedContent = marked.parse(content);
    const post = new Post({
      title,
      content: parsedContent,
      rawContent: content, // Store raw markdown for editing
      user: userId,
      tags,
    });
    await post.save();
    
    // Populate user info
    await post.populate('user', 'name email');

    await new Activity({
      user: userId,
      action: "create_post",
      target: post._id.toString(),
    }).save();
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, tags } = req.body;
  const { id } = req.params;
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    if (post.user.toString() !== userId) {
      res.status(403).json({ msg: "Not authorized to edit this post" });
      return;
    }
    
    post.title = title || post.title;
    post.rawContent = content || post.rawContent;
    post.content = content ? marked.parse(content) : post.content;
    post.tags = tags || post.tags;
    post.updatedAt = new Date();
    
    await post.save();
    await post.populate('user', 'name email');
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    if (post.user.toString() !== userId) {
      res.status(403).json({ msg: "Not authorized to delete this post" });
      return;
    }
    
    await Post.findByIdAndDelete(id);
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    
    await new Activity({
      user: userId,
      action: likeIndex > -1 ? "unlike_post" : "like_post",
      target: post._id.toString(),
    }).save();
    
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getFeed = async (req: Request, res: Response): Promise<void> => {
  const { page = "1", limit = "10", sort = "createdAt" } = req.query;
  try {
    const posts = await Post.find()
      .populate('user', 'name email')
      .sort({ [sort as string]: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
      
    const hasMore = posts.length === parseInt(limit as string);
    res.json({ posts, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const searchPosts = async (req: Request, res: Response): Promise<void> => {
  const {
    query,
    tags,
    sort = "createdAt",
    page = "1",
    limit = "10",
  } = req.query;
  
  const filter: any = {};
  if (query) filter.$text = { $search: query as string };
  if (tags) filter.tags = { $in: (tags as string).split(",") };

  try {
    const posts = await Post.find(filter)
      .populate('user', 'name email')
      .sort({ [sort as string]: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
      
    const total = await Post.countDocuments(filter);
    const hasMore = (parseInt(page as string) * parseInt(limit as string)) < total;
    
    res.json({ posts, hasMore, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { postId, text, parentId } = req.body;
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    
    const post = await Post.findById(postId).populate('user', 'name email');
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }

    const comment = {
      text,
      user: userId,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (parentId) {
      const addToReplies = (comments: any[], depth = 0): boolean => {
        if (depth >= 5) return false; // Max depth limit
        
        for (let c of comments) {
          if (c._id.toString() === parentId) {
            c.replies.push(comment);
            return true;
          }
          if (addToReplies(c.replies, depth + 1)) return true;
        }
        return false;
      };
      
      if (!addToReplies(post.comments)) {
        res.status(400).json({ msg: "Parent comment not found or max depth reached" });
        return;
      }
    } else {
      post.comments.push(comment);
    }
    
    await post.save();
    await post.populate('comments.user', 'name email');
    
    await new Activity({
      user: userId,
      action: "comment",
      target: postId,
    }).save();
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { postId, depth = "0", page = "1", limit = "10" } = req.query;
  try {
    const post = await Post.findById(postId).populate('comments.user', 'name email');
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }

    // Simple pagination for top level comments
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const comments = post.comments.slice(startIndex, endIndex);
    
    const hasMore = endIndex < post.comments.length;
    
    res.json({ comments, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id)
      .populate('user', 'name email')
      .populate('comments.user', 'name email');
      
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};