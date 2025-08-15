// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '../store';
// import { login, signup } from '../slices/authSlice';
// import { useNavigate } from 'react-router-dom';

// interface FormData {
//   name?: string;
//   email: string;
//   password: string;
// }

// const AuthForm: React.FC<{ isSignup?: boolean }> = ({ isSignup = false }) => {
//   const { register, handleSubmit } = useForm<FormData>();

//   const dispatch = useDispatch<AppDispatch>();
//    const navigate = useNavigate();
//   const [error, setError] = useState<string | null>(null);

//   const onSubmit = (data: FormData) => {
//     if (isSignup) {
//       dispatch(signup(data as { name: string; email: string; password: string }));
//     } else {
//       dispatch(login(data));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
//       {isSignup && <input {...register('name')} placeholder="Name" className="w-full border p-2 mb-4 rounded" />}
//       <input {...register('email')} placeholder="Email" className="w-full border p-2 mb-4 rounded" />
//       <input {...register('password')} type="password" placeholder="Password" className="w-full border p-2 mb-4 rounded" />
//       <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">{isSignup ? 'Signup' : 'Login'}</button>
//     </form>
//   );
// };

// export default AuthForm;






import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { login, signup } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name?: string;
  email: string;
  password: string;
}

const AuthForm: React.FC<{ isSignup?: boolean }> = ({ isSignup = false }) => {
  const { register, handleSubmit } = useForm<FormData>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      if (isSignup) {
        await dispatch(signup(data as { name: string; email: string; password: string })).unwrap();
      } else {
        await dispatch(login(data)).unwrap();
      }
      // Redirect on success
      navigate('/profile');
    } catch (err: any) {
      setError('Login/Signup failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      {isSignup && <input {...register('name')} placeholder="Name" className="w-full border p-2 mb-4 rounded" />}
      <input {...register('email')} placeholder="Email" className="w-full border p-2 mb-4 rounded" />
      <input {...register('password')} type="password" placeholder="Password" className="w-full border p-2 mb-4 rounded" />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">{isSignup ? 'Signup' : 'Login'}</button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
};

export default AuthForm;