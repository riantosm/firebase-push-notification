import PushNotification from 'react-native-push-notification';
import {colors as c} from '../styles'

class LocalNotificationService {
  configure = onOpenNotification => {
    PushNotification.configure({
      onRegister: function(token) {
        console.log('[LocalNotificationService] onRegister: ', token);
      },
      onNotification: function(notification) {
        console.log(
          '[LocalNotificationService] onNotification: ',
          notification,
        );
        if (!notification?.data) {
          return;
        }
        notification.userInteraction = true;
        onOpenNotification(notification.data);
      },

      // ios only (optional): default: all - permission to register
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      //
      popInitialNotification: true,

      //
      requestPermissions: true,
    });
  };

  unregister = () => {
    PushNotification.unregister();
  };

  showNotification = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      ...this.buildAndroidNotification(id, title, message, data, options),
      title: title || '',
      message: message || '',
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      userInteraction: false,
      color: c.primary,
    });
  };

  buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
    return {
      id: id,
      autoCancel: true,
      largeIcon: options.largeIcon || 'ic_launcher',
      smallIcon: options.smallIcon || 'ic_notification',
      bigText: message || '',
      sebText: title || '',
      vibrate: options.vibrate || true,
      vibrate: options.vibrate || 300,
      priority: options.priority | 'hight',
      importance: options.importance || 'hight',
      data: data,
    };
  };

  cancleAllLocalNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  removeDeliveredNotificationByID = notificationId => {
    console.log(
      '[LocalNotificationService] removeDeliveredNotificationByID: ',
      notificationId,
    );
    PushNotification.cancelAllLocalNotifications({id: `${notificationId}`});
  };
}

export const localNotificationService = new LocalNotificationService();
