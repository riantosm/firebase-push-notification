import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button, TextInput} from 'react-native';
import {fcmService} from './services/FCMService';
import {localNotificationService} from './services/LocalNotificationService';

const App = props => {
  const [token, setToken] = useState('');

  useEffect(() => {
    fcmService.registerAppWithFCM();
    fcmService.register(onRegister, onNotification, onOpenNotification);
    localNotificationService.configure(onOpenNotification);

    function onRegister(token) {
      console.log('[App] onRegister: ', token);
      setToken(token);
    }
    function onNotification(notify) {
      console.log('[App] onNotification: ', notify);
      const options = {
        sound: 'default',
        playSound: true,
      };
      localNotificationService.showNotification(
        0,
        notify.title,
        notify.body,
        notify,
        options,
      );
    }
    function onOpenNotification(notify) {
      console.log('[App] onOpenNotification: ', notify);
      alert('Open Notification: ' + notify.body);
    }

    return () => {
      console.log('[App] unRegister');
      fcmService.unRegister();
      localNotificationService.unregister();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Token</Text>
      <Text>{token}</Text>
      <Button
        title="Press me"
        onPress={() => localNotificationService.cancleAllLocalNotifications()}
      />
      <TextInput placeholder="test" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
