import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

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

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user ID:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return null;
      }
      
      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, profileData: Omit<Profile, 'id' | 'city' | 'is_premium' | 'is_admin' | 'daily_offers_count' | 'last_offer_reset' | 'created_at' | 'free_offers_used' | 'total_offers_sent'>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Kayıt başarısız');

    console.log('Creating profile with data:', {
      id: data.user.id,
      ...profileData,
    });

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

    // Immediately fetch and set the profile to avoid delay
    const newProfile = await fetchProfile(data.user.id);
    if (newProfile) {
      setProfile(newProfile);
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

    console.log('Creating profile with phone data:', {
      id: data.user.id,
      ...profileData,
      phone: phone,
    });

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

    // Immediately fetch and set the profile to avoid delay
    const newProfile = await fetchProfile(data.user.id);
    if (newProfile) {
      setProfile(newProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Immediately fetch and set the profile to avoid delay
    if (data.user) {
      const userProfile = await fetchProfile(data.user.id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Profil bulunamazsa hata fırlat
        throw new Error('Profil bulunamadı. Lütfen önce kayıt olun.');
      }
    }
  };

  const signInWithPhone = async (phone: string, password: string) => {
    // Telefon numarasını email formatına çevir (Supabase için)
    const phoneEmail = `${phone.replace(/\D/g, '')}@phone.local`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: phoneEmail,
      password,
    });

    if (error) throw error;

    // Immediately fetch and set the profile to avoid delay
    if (data.user) {
      const userProfile = await fetchProfile(data.user.id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Profil bulunamazsa hata fırlat
        throw new Error('Profil bulunamadı. Lütfen önce kayıt olun.');
      }
    }
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
