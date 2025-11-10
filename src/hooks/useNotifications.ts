import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../lib/notifications';

export function useNotifications() {
  const { profile } = useAuth();

  const handleNewNotification = useCallback(async (payload: any) => {
    const notification = payload.new;
    
    // Show browser notification based on type
    switch (notification.type) {
      case 'new_offer_request':
        const senderName = notification.data?.sender_name || 'Birisi';
        const offerTitle = notification.data?.offer_title || 'talebinize';
        await notificationService.showOfferNotification(senderName, offerTitle);
        break;
        
      case 'offer_accepted':
        const creatorName = notification.data?.creator_name || 'Birisi';
        const acceptedTitle = notification.data?.offer_title || 'teklifinizi';
        await notificationService.showAcceptedNotification(creatorName, acceptedTitle);
        break;
        
      case 'new_message':
        const messageSender = notification.data?.sender_name || 'Birisi';
        await notificationService.showMessageNotification(messageSender);
        break;
        
      case 'boost_activated':
        await notificationService.showBoostNotification();
        break;
        
      case 'super_like_received':
        const superLikeSender = notification.data?.sender_name || 'Birisi';
        await notificationService.showSuperLikeNotification(superLikeSender);
        break;
    }
  }, []);

  useEffect(() => {
    if (!profile) return;

    // Request notification permission on first load
    notificationService.requestPermission();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, handleNewNotification]);

  return {
    requestPermission: notificationService.requestPermission,
    showNotification: notificationService.showNotification,
  };
}
