import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { TextInput, Button, Snackbar,Title } from 'react-native-paper';
import APIs, {authApi, endpoints} from '../../configs/APIs'; // Đường dẫn tới file API.js
import AsyncStorage from '@react-native-async-storage/async-storage';
// const userToken = 'x4dgJtWn0FG5g9QFfRhgxAEKYXkuGw'; // Đảm bảo khai báo const

const ChangePassword = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isCurrentPasswordSecure, setIsCurrentPasswordSecure] = useState(true);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
  const [access_token, setAccessToken] = useState('');

  useEffect(() => {
    const loadToken = async () => {
        const token = await AsyncStorage.getItem('token');
        setAccessToken(token);
    }
    loadToken()
  }, [])

  const handleChangePassword = async () => {
    Keyboard.dismiss()
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (!newPassword || newPassword.length < 6) {
      setSnackbarMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      setSnackbarVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbarMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi(access_token).patch(
        `${endpoints.NguoiDung}/change-password/`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
      );

      if (response.status === 200) {
        setSnackbarMessage('Mật khẩu đã được thay đổi thành công.');
        setSnackbarVisible(true);
        
      } else {
        setSnackbarMessage('Đã có lỗi xảy ra khi thay đổi mật khẩu.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setSnackbarMessage('Mật khẩu hiện tại không chính xác.');
        setSnackbarVisible(true);
      } else {
        console.error('Change password error:', error.message);
        setSnackbarMessage('Đã có lỗi xảy ra khi thay đổi mật khẩu.');
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Title style={styles.title}>
          Đặt lại mật khẩu
        </Title>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          label="Mật khẩu hiện tại"
          mode="outlined"
          secureTextEntry={isCurrentPasswordSecure}
          value={currentPassword}
          onChangeText={(text) => setCurrentPassword(text)}
          style={styles.input}
          right={<TextInput.Icon icon={isCurrentPasswordSecure ? 'eye-off' : 'eye'} onPress={() => setIsCurrentPasswordSecure(prev => !prev)} />}
        />
        <TextInput
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          style={styles.input}
          mode="outlined"
          secureTextEntry={isPasswordSecure}
          right={<TextInput.Icon icon={isPasswordSecure ? 'eye-off' : 'eye'} onPress={() => setIsPasswordSecure(prev => !prev)} />}
        />
        <TextInput
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          style={styles.input}
          mode="outlined"
          secureTextEntry={isConfirmPasswordSecure}
          right={<TextInput.Icon icon={isConfirmPasswordSecure ? 'eye-off' : 'eye'} onPress={() => setIsConfirmPasswordSecure(prev => !prev)} />}
        />
      </View>
      <Button
        mode="contained"
        onPress={handleChangePassword}
        loading={loading}
        style={styles.button}
      >
        Đổi mật khẩu
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false)
          navigation.goBack()
        }}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  info:{
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center',
    marginBottom:10
  },
  title:{
    fontWeight:"bold",
    fontSize:25,
    marginBottom: 0,
  },
});

export default ChangePassword;
