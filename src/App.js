import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {api_fcm, server_key} from 'react-native-dotenv';
import {fcmService} from './services/FCMService';
import {localNotificationService} from './services/LocalNotificationService';
import {colors as c, fonts as f} from './styles';

const {width, height} = Dimensions.get('window');

const App = () => {
  const [text, setText] = useState('');
  const [wait, setWait] = useState(false);

  useEffect(() => {
    fcmService.registerAppWithFCM();
    fcmService.register(onRegister, onNotification, onOpenNotification);
    localNotificationService.configure(onOpenNotification);

    function onRegister(token) {
      console.log('[App] onRegister: ', token);
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

  handleSubmit = () => {
    let to = '/topics/all'; // <--- send to all
    // let to = 'fnIzIhiLRV-aMKtloe8Uv1:APA91bHaa....'; <--- send to one device (use token)
    text.length === 0 ? alert('Harap isi pesan notifikasi.') : sendNotif(to);
  };

  sendNotif = to => {
    setWait(true);
    fetch(api_fcm, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${server_key}`, // server key firebase
      },
      body: JSON.stringify({
        to,
        collapse_key: 'type_a',
        notification: {
          body: `Dan dia mengetik: '${text}'. Notifikasi ini dikirim ke semua device yang menginstall aplikasi ini. jika menggangu silakan uninstall.`,
          title: 'Ada yang sedang mencoba aplikasi ini!',
        },
      }),
    }).then(response => {
      console.log(response);
      setWait(false);
      alert('Notifikasi terkirim');
      setText('');
    });
  };

  return (
    <ScrollView style={s.scrollView}>
      <View style={s.container}>
        <Text style={s.title}>Firebase</Text>
        <Text style={s.text}>Notifikasi</Text>
        <TextInput
          placeholder="Pesan Notifikasi"
          style={s.textInput}
          value={text}
          onChangeText={value => setText(value)}
        />
        {wait ? (
          <ActivityIndicator style={s.loading} />
        ) : (
          <TouchableOpacity onPress={() => handleSubmit()} style={s.btn}>
            <Text style={s.btnText}>Kirim</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://github.com/riantosm')}
        style={s.link}>
        <Text style={s.linkText}>https://github.com/riantosm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f2f2f2',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: height - 50,
  },
  title: {
    fontSize: 64,
    marginBottom: 0,
    textAlign: 'center',
    paddingHorizontal: 50,
    color: c.primary,
    fontFamily: f.Aquawax,
  },
  text: {fontFamily: f.GoogleSans_Medi, color: c.secondary},
  textInput: {
    borderWidth: 1,
    borderRadius: 100,
    borderColor: '#cccccc',
    width: '90%',
    marginTop: 30,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  btn: {
    marginTop: 20,
    backgroundColor: c.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnText: {color: '#f2f2f2', fontFamily: f.GoogleSans_Medi},
  loading: {
    marginTop: 20,
  },
  link: {position: 'absolute', bottom: 0, width: '100%'},
  linkText: {
    textAlign: 'center',
    fontFamily: f.GoogleSans_Bold,
    color: c.primary,
    fontSize: 10,
  },
});

export default App;
