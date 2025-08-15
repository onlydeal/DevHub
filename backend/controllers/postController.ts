// backend/controllers/postController.ts
import { Request, Response } from "express";
import Post from "../models/Post";
import Activity from "../models/Activity";
import { marked } from "marked";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { title, content, tags } = req.body;
  // try {
  //   const parsedContent = marked.parse(content);
  //   const post = new Post({
  //     title,
  //     content: parsedContent,
  //     user: req.user.id,
  //     tags,
  //   });
  //   await post.save();

  //   await new Activity({
  //     user: req.user.id,
  //     action: "create_post",
  //     target: post._id.toString(),
  //   }).save();
  //   res.json(post);
  // } catch (err) {
  //   res.status(500).json({ msg: "Server error" });
  // }

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    const parsedContent = marked.parse(content);
    const post = new Post({
      title,
      content: parsedContent,
      user: userId,
      tags,
    });
    await post.save();

    await new Activity({
      user: userId,
      action: "create_post",
      target: post._id.toString(),
    }).save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getFeed = async (req: Request, res: Response): Promise<void> => {
  const { page = "1", limit = "10" } = req.query;
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
    res.json({ posts, hasMore: posts.length === parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const searchPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      .sort({ [sort as string]: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { postId, text, parentId } = req.body;
  // try {
  //   const post = await Post.findById(postId);
  //   if (!post) {
  //     res.status(404).json({ msg: "Post not found" });
  //     return;
  //   }

  //   const comment = { text, user: req.user.id, replies: [], createdAt: new Date(), updatedAt: new Date() };

  //   if (parentId) {
  //     const addToReplies = (comments: any[]): boolean => {
  //       for (let c of comments) {
  //         if (c._id.toString() === parentId) {
  //           c.replies.push(comment);
  //           return true;
  //         }
  //         if (addToReplies(c.replies)) return true;
  //       }
  //       return false;
  //     };
  //     addToReplies(post.comments);
  //   } else {
  //     post.comments.push(comment);
  //   }
  //   await post.save();
  //   await new Activity({
  //     user: req.user.id,
  //     action: "comment",
  //     target: postId,
  //   }).save();
  //   res.json(post);
  // } catch (err) {
  //   res.status(500).json({ msg: "Server error" });
  // }

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }

    const comment = { text, user: userId, replies: [], createdAt: new Date(), updatedAt: new Date() };

    if (parentId) {
      const addToReplies = (comments: any[]): boolean => {
        for (let c of comments) {
          if (c._id.toString() === parentId) {
            c.replies.push(comment);
            return true;
          }
          if (addToReplies(c.replies)) return true;
        }
        return false;
      };
      addToReplies(post.comments);
    } else {
      post.comments.push(comment);
    }
    await post.save();
    await new Activity({
      user: userId,
      action: "comment",
      target: postId,
    }).save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postId, depth = "0", page = "1", limit = "10" } = req.query;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }

    // Simple pagination for top level; for depth, client handles
    const comments = post.comments.slice(
      (parseInt(page as string) - 1) * parseInt(limit as string),
      parseInt(limit as string)
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
