import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

class FCMService {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    this.createNotificationListeners(
      onRegister,
      onNotification,
      onOpenNotification,
    );
  };

  registerAppWithFCM = async () => {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  };

  checkPermission = onRegister => {
    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          // user has permissions
          this.getToken(onRegister);
        } else {
          // user doens't have permission
          this.requestPermission(onRegister);
        }
      })
      .catch(error => {
        console.log('[FCMService] Permission rejected ', error);
      });
  };

  getToken = onRegister => {
    messaging()
      .getToken()
      .then(fcmToken => {
        if (fcmToken) {
          onRegister(fcmToken);
          messaging().subscribeToTopic('all');
        } else {
          console.log('[FCMService] user does not have a device token');
        }
      })
      .catch(error => {
        console.log('[FCMService] getToken rejected ', error);
      });
  };

  requestPermission = onRegister => {
    messaging()
      .requestPermission()
      .then(() => {
        this.getToken(onRegister);
      })
      .catch(error => {
        console.log('[FCMService] request permission rejected ', error);
      });
  };

  deleteToken = () => {
    console.log('[FCMService] deleteToken ');
    messaging()
      .deleteToken()
      .catch(error => {
        console.log('[FCMService] delete token error ', error);
      });
  };

  createNotificationListeners = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) => {
    // when the app is running, but in the backgroud
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        '[FCMService] onNotificationOpenedApp Notification caused app to open',
      );
      if (remoteMessage) {
        const notification = remoteMessage.notification;
        onOpenNotification(notification);
        // this.removeDeliveredNotification(notification.notificationId)
      }
    });

    // when the app is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log(
          '[FCMService] getInitialNotification Notification caused app to open',
        );
        if (remoteMessage) {
          const notification = remoteMessage.notification;
          onOpenNotification(notification);
          // this.removeDeliveredNotification(notification.notificationId)
        }
      });

    // foreground state messages
    this.messageListener = messaging().onMessage(async remoteMessage => {
      console.log('[FCMService] a new FCM message arrived!', remoteMessage);
      if (remoteMessage) {
        let notification = null;
        if (Platform.OS === 'ios') {
          notification = remoteMessage.data.notification;
        } else {
          notification = remoteMessage.notification;
        }
        onNotification(notification);
      }
    });

    // triggered when have new token
    messaging().onTokenRefresh(fcmToken => {
      console.log('[FCMService] new token refresg: ', fcmToken);
      onRegister(fcmToken);
    });
  };

  unRegister = () => {
    this.messageListener();
  };
}

export const fcmService = new FCMService();
