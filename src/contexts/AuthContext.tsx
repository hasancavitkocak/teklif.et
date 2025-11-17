import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { mobileDebug } from '../utils/mobileDebug';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Omit<Profile, 'id' | 'city' | 'is_premium' | 'is_admin' | 'daily_offers_count' | 'last_offer_reset' | 'created_at' | 'free_offers_used' | 'total_offers_sent'>) => Promise<void>;
  signUpWithPhone: (phone: string, password: string, profileData: Omit<Profile, 'id' | 'city' | 'is_premium' | 'is_admin' | 'daily_offers_count' | 'last_offer_reset' | 'created_at' | 'free_offers_used' | 'total_offers_sent'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile cache to avoid unnecessary fetches
  const profileCacheRef = useState<{ [userId: string]: { data: Profile; timestamp: number } }>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchProfile = async (userId: string, forceRefresh = false) => {
    // Clean and validate userId
    const cleanUserId = userId?.toString().trim();
    if (!cleanUserId || cleanUserId.length < 10) {
      console.error('Invalid userId:', userId);
      return null;
    }

    // Check cache first
    const cached = profileCacheRef[0][cleanUserId];
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Using cached profile for user:', cleanUserId);
      return cached.data;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching profile for user ID:', cleanUserId);
    }
    try {
      // Try with all columns first, fallback to essential columns if error
      let data, error;
      
      try {
        // Use * for cleaner URL and better performance
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', cleanUserId)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      } catch (fullError) {
        console.warn('Full profile fetch failed, trying essential columns:', fullError);
        
        // Fallback to essential columns only
        const result = await supabase
          .from('profiles')
          .select('id, name, age, gender, city, bio, photos, photo_url, is_premium, created_at')
          .eq('id', cleanUserId)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
        
        // Add default values for missing columns
        if (data) {
          const profile = data as any;
          profile.free_offers_used = profile.free_offers_used || 0;
          profile.total_offers_sent = profile.total_offers_sent || 0;
          profile.phone = profile.phone || '';
          profile.email = profile.email || '';
          profile.birth_date = profile.birth_date || null;
          profile.show_profile = profile.show_profile !== false;
          profile.looking_for = profile.looking_for || [];
          profile.education_level = profile.education_level || 'universite';
          profile.has_pets = profile.has_pets || false;
          profile.pet_type = profile.pet_type || '';
          profile.drinks_alcohol = profile.drinks_alcohol || 'hayir';
          profile.smokes = profile.smokes || 'hayir';
          profile.photos = profile.photos || [];
          profile.is_boosted = profile.is_boosted || false;
          profile.boost_expires_at = profile.boost_expires_at || null;
          profile.super_likes_remaining = profile.super_likes_remaining || 0;
          profile.daily_offers_count = profile.daily_offers_count || 0;
          profile.last_offer_reset = profile.last_offer_reset || null;
          profile.phone_verified = profile.phone_verified || false;
          profile.email_verified = profile.email_verified || false;
        }
      }

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (!data) {
        console.log('No profile found for user:', cleanUserId);
        return null;
      }
      
      // Cache the result
      profileCacheRef[0][cleanUserId] = {
        data: data as unknown as Profile,
        timestamp: now
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile fetched and cached successfully');
      }
      return data as unknown as Profile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, true); // Force refresh
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        mobileDebug.log('Auth initialization started');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        mobileDebug.log('Session fetched', { hasSession: !!session });
        setUser(session?.user ?? null);
        
        if (session?.user) {
          mobileDebug.log('Fetching profile for user');
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
            mobileDebug.log('Profile set', { hasProfile: !!profileData });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        mobileDebug.error('Auth initialization failed', error);
      } finally {
        if (isMounted) {
          mobileDebug.log('Auth initialization completed');
          setLoading(false);
        }
      }
    };

    // Timeout ekle - 10 saniye sonra loading'i false yap
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 10000);

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', event);
      }
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Sadece login durumunda profil fetch et, register sonrası değil
        if (event === 'SIGNED_IN' && !profile) {
          // Biraz bekle, register işlemi tamamlanmış olabilir
          await new Promise(resolve => setTimeout(resolve, 200));
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
          }
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, profileData: Omit<Profile, 'id' | 'city' | 'is_premium' | 'is_admin' | 'daily_offers_count' | 'last_offer_reset' | 'created_at' | 'free_offers_used' | 'total_offers_sent'>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Kayıt başarısız');

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating profile with data:', {
        id: data.user.id,
        ...profileData,
      });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        ...profileData,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      console.error('Error details:', profileError.message, profileError.details, profileError.hint);
      throw profileError;
    }

    // Wait a bit for database consistency, then fetch profile
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try to fetch the profile with limited retries
    let retries = 2;
    let newProfile = null;
    
    while (retries > 0 && !newProfile) {
      try {
        newProfile = await fetchProfile(data.user.id, true); // Force refresh
        if (newProfile) {
          setProfile(newProfile);
          break;
        }
      } catch (fetchError) {
        console.warn('Profile fetch attempt failed:', fetchError);
      }
      
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!newProfile) {
      console.warn('Could not fetch profile after registration, will be fetched on auth state change');
      // Don't throw error, let auth state change handle it
    }
  };

  const signUpWithPhone = async (phone: string, password: string, profileData: Omit<Profile, 'id' | 'city' | 'is_premium' | 'is_admin' | 'daily_offers_count' | 'last_offer_reset' | 'created_at' | 'free_offers_used' | 'total_offers_sent'>) => {
    // Telefon numarasını email formatına çevir (Supabase için)
    const phoneEmail = `${phone.replace(/\D/g, '')}@phone.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email: phoneEmail,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Kayıt başarısız');

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating profile with phone data:', {
        id: data.user.id,
        ...profileData,
        phone: phone,
      });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        ...profileData,
        phone: phone,
      });

    if (profileError) {
      console.error('Profile creation error (phone):', profileError);
      console.error('Error details:', profileError.message, profileError.details, profileError.hint);
      throw profileError;
    }

    // Wait a bit for database consistency, then fetch profile
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try to fetch the profile with limited retries
    let retries = 2;
    let newProfile = null;
    
    while (retries > 0 && !newProfile) {
      try {
        newProfile = await fetchProfile(data.user.id, true); // Force refresh
        if (newProfile) {
          setProfile(newProfile);
          break;
        }
      } catch (fetchError) {
        console.warn('Profile fetch attempt failed:', fetchError);
      }
      
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!newProfile) {
      console.warn('Could not fetch profile after phone registration, will be fetched on auth state change');
      // Don't throw error, let auth state change handle it
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Profile will be fetched automatically by onAuthStateChange
    // No need to fetch here to avoid double fetching
  };

  const signInWithPhone = async (phone: string, password: string) => {
    // Telefon numarasını email formatına çevir (Supabase için)
    const phoneEmail = `${phone.replace(/\D/g, '')}@phone.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneEmail,
      password,
    });

    if (error) throw error;

    // Profile will be fetched automatically by onAuthStateChange
    // No need to fetch here to avoid double fetching
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signUpWithPhone, signIn, signInWithPhone, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
