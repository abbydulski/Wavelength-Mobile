import { supabase } from './supabase';

/**
 * Sign up a new user
 */
export const signup = async (email, password, displayName) => {
  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email,
          display_name: displayName,
          bio: '',
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) throw profileError;

    return data.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user with profile data
 */
export const getCurrentUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Follow a user
 */
export const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) return false;

  try {
    // Check if already following
    const { data: existing } = await supabase
      .from('follow_requests')
      .select('id')
      .eq('from_user_id', currentUserId)
      .eq('to_user_id', targetUserId)
      .single();

    if (existing) return true;

    // Create follow request
    const { error } = await supabase.from('follow_requests').insert([
      {
        from_user_id: currentUserId,
        to_user_id: targetUserId,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error requesting follow:', error);
    return false;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) return false;

  try {
    // Remove from following
    const { error: error1 } = await supabase
      .from('users')
      .update({ following: null })
      .eq('id', currentUserId);

    // Remove from followers
    const { error: error2 } = await supabase
      .from('users')
      .update({ followers: null })
      .eq('id', targetUserId);

    if (error1 || error2) throw error1 || error2;
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

/**
 * Agree with a post
 */
export const agreeWithPost = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ agreed_by: [userId] })
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error agreeing with post:', error);
    return false;
  }
};

/**
 * Disagree with a post
 */
export const disagreeWithPost = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ disagreed_by: [userId] })
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error disagreeing with post:', error);
    return false;
  }
};

/**
 * Add a comment to a post
 */
export const addComment = async (userId, postId, commentText, displayName, photoURL) => {
  if (!commentText.trim()) return false;

  try {
    const { error } = await supabase.from('comments').insert([
      {
        post_id: postId,
        user_id: userId,
        username: displayName || 'User',
        user_avatar: photoURL || '',
        text: commentText.trim(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

/**
 * Delete a post
 */
export const deletePost = async (postId) => {
  try {
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};
