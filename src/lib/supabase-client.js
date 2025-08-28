/**
 * Supabase Client Configuration
 * Handles database connections, authentication, and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Authentication helpers
 */
export const auth = {
  /**
   * Sign in as guest user
   */
  async signInAsGuest(username) {
    try {
      // For guest users, we'll create a temporary session
      // In a real app, you might want to use anonymous auth
      const guestUser = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: username || `Guest_${Math.random().toString(36).substr(2, 6)}`,
        is_guest: true,
        created_at: new Date().toISOString()
      };
      
      // Store guest user in localStorage
      localStorage.setItem('guest_user', JSON.stringify(guestUser));
      
      return { user: guestUser, error: null };
    } catch (error) {
      console.error('Guest sign in error:', error);
      return { user: null, error };
    }
  },

  /**
   * Get current user (authenticated or guest)
   */
  async getCurrentUser() {
    try {
      // Check for authenticated user first
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        return { user, error: null };
      }
      
      // Check for guest user
      const guestUser = localStorage.getItem('guest_user');
      if (guestUser) {
        return { user: JSON.parse(guestUser), error: null };
      }
      
      return { user: null, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      // Sign out authenticated user
      await supabase.auth.signOut();
      
      // Remove guest user
      localStorage.removeItem('guest_user');
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }
};

/**
 * Chat message helpers
 */
export const chatMessages = {
  /**
   * Subscribe to chat messages in real-time
   */
  subscribe(roomId, callback) {
    return supabase
      .channel(`chat_messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        callback
      )
      .subscribe();
  },

  /**
   * Send a chat message
   */
  async send(roomId, userId, username, content, messageType = 'text') {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          username: username,
          content: content,
          message_type: messageType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Send message error:', error);
      return { data: null, error };
    }
  },

  /**
   * Get recent chat messages
   */
  async getRecent(roomId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return { data: data?.reverse() || [], error };
    } catch (error) {
      console.error('Get recent messages error:', error);
      return { data: [], error };
    }
  }
};

/**
 * Voice session helpers
 */
export const voiceSessions = {
  /**
   * Subscribe to voice participants in real-time
   */
  subscribeToParticipants(sessionId, callback) {
    return supabase
      .channel(`voice_participants:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_participants',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe();
  },

  /**
   * Join a voice session
   */
  async join(sessionId, userId, username) {
    try {
      const { data, error } = await supabase
        .from('voice_participants')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          username: username,
          is_speaking: false,
          is_muted: false,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Join voice session error:', error);
      return { data: null, error };
    }
  },

  /**
   * Leave a voice session
   */
  async leave(sessionId, userId) {
    try {
      const { error } = await supabase
        .from('voice_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);
      
      return { error };
    } catch (error) {
      console.error('Leave voice session error:', error);
      return { error };
    }
  },

  /**
   * Update speaking status
   */
  async updateSpeakingStatus(sessionId, userId, isSpeaking) {
    try {
      const { data, error } = await supabase
        .from('voice_participants')
        .update({ is_speaking: isSpeaking })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Update speaking status error:', error);
      return { data: null, error };
    }
  },

  /**
   * Update mute status
   */
  async updateMuteStatus(sessionId, userId, isMuted) {
    try {
      const { data, error } = await supabase
        .from('voice_participants')
        .update({ is_muted: isMuted })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Update mute status error:', error);
      return { data: null, error };
    }
  },

  /**
   * Get current participants
   */
  async getParticipants(sessionId) {
    try {
      const { data, error } = await supabase
        .from('voice_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Get participants error:', error);
      return { data: [], error };
    }
  }
};

/**
 * User helpers
 */
export const users = {
  /**
   * Subscribe to user updates
   */
  subscribe(callback) {
    return supabase
      .channel('users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        callback
      )
      .subscribe();
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user by ID
   */
  async getById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return { data: null, error };
    }
  }
};

/**
 * Utility functions
 */
export const utils = {
  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const { user } = await auth.getCurrentUser();
    return !!user;
  },

  /**
   * Get user display name
   */
  getUserDisplayName(user) {
    if (!user) return 'Anonymous';
    return user.username || user.email || `User_${user.id.slice(-6)}`;
  },

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Generate room ID
   */
  generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Validate room ID format
   */
  isValidRoomId(roomId) {
    return typeof roomId === 'string' && roomId.length > 0;
  }
};

// Export default client
export default supabase;