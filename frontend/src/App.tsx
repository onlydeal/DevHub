import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthForm from './components/AuthForm';
import ProfileWizard from './components/ProfileWizard';
import PostFeed from './components/PostFeed';
import BookmarkList from './components/BookmarkList';
import ChatRoom from './components/ChatRoom';
import NotificationToast from './components/NotificationToast';
import PrivateRoute from './components/PrivateRoute';
import { useSelector } from 'react-redux';
import { RootState } from './store';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Router>
      <NotificationToast />
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navigation />}
        <div className={`${isAuthenticated ? 'pt-16' : ''} min-h-screen flex flex-col items-center justify-center p-4 md:p-8`}>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          <Route path="/signup" element={<AuthForm isSignup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfileWizard />} />
            <Route path="/" element={<PostFeed />} />
            <Route path="/bookmarks" element={<BookmarkList />} />
            <Route path="/chat" element={<ChatRoom />} />
          </Route>
        </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;