// // backend/controllers/authController.ts
// import { Request, Response } from 'express';
// import User from '../models/User';
// import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
// import { createClient } from 'redis';

// const client = createClient({ url: process.env.REDIS_URI });
// client.connect();

// export const signup = async (req: Request, res: Response): Promise<void> => {
//   const { name, email, password } = req.body;
//   try {
//     let user = await User.findOne({ email });
//     if (user) {
//       res.status(400).json({ msg: 'User exists' });
//       return;
//     }

//     user = new User({ name, email, password });
//     await user.save();

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// };

// export const login = async (req: Request, res: Response): Promise<void> => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !await user.matchPassword(password)) {
//       const failedKey = `failed:${req.ip}`;
//       const count = await client.incr(failedKey);
//       if (count === 1) await client.expire(failedKey, 300);
//       if (count > 5) await client.setEx(`block:${req.ip}`, 3600, '1');
//       res.status(401).json({ msg: 'Invalid credentials' });
//       return;
//     }

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
//     const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET as string, { expiresIn: '7d' });
//     res.cookie('refreshToken', refreshToken, { httpOnly: true });
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// };

// export const refreshToken = async (req: Request, res: Response): Promise<void> => {
//   const refreshToken = req.cookies.refreshToken;
//   if (!refreshToken) {
//     res.status(401).json({ msg: 'No refresh token' });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as { id: string };
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       res.status(401).json({ msg: 'Invalid refresh token' });
//       return;
//     }

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (err) {
//     res.status(401).json({ msg: 'Invalid refresh token' });
//   }
// };

// export const resetPassword = async (req: Request, res: Response): Promise<void> => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(404).json({ msg: 'User not found' });
//       return;
//     }

//     const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
//     });
//     await transporter.sendMail({
//       to: email,
//       subject: 'Password Reset',
//       text: `Reset link: http://localhost:3000/reset/${resetToken}`
//     });
//     res.json({ msg: 'Reset email sent' });
//   } catch (err) {
//     res.status(500).json({ msg: 'Error sending email' });
//   }
// };

// // Add endpoint for updating password with reset token
// export const updatePassword = async (req: Request, res: Response): Promise<void> =>{
//   const { token, newPassword } = req.body;
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       res.status(404).json({ msg: 'User not found' });
//       return;
//     }
//     user.password = newPassword;
//     await user.save();
//     res.json({ msg: 'Password updated' });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// };




import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import nodemailer from 'nodemailer';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }
    user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET as string, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await user.matchPassword(password)) {
      res.status(401).json({ msg: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET as string, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ msg: 'No refresh token' });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ msg: 'Invalid refresh token' });
      return;
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ msg: 'Invalid refresh token' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      text: 'Reset your password using this link.', // Mock implementation
    });
    res.json({ msg: 'Reset email sent' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    user.password = password;
    await user.save();
    res.json({ msg: 'Password updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, skills, bio } = req.body;
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }
    user.name = name || user.name;
    user.skills = skills ? skills.split(',').map((s: string) => s.trim()) : user.skills;
    user.bio = bio || user.bio;
    await user.save();
    res.json({ msg: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, skills: user.skills, bio: user.bio } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};