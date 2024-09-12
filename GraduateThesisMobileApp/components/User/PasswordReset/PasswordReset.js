import React, { useState, useCallback, useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Snackbar, Title, Text } from 'react-native-paper';
import APIs, { endpoints } from '../../../configs/APIs'; // Đường dẫn tới file API.js
import { MyUserContext } from '../../../configs/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../../configs/APIs';

const PasswordReset = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const user = useContext(MyUserContext)
  const [access_token, setAccessToken] = useState('');

  useEffect(() => {
    const loadToken = async () => {
        const token = await AsyncStorage.getItem('token');
        setAccessToken(token);
    }
    loadToken()
  }, [])
  const handleSendConfirmationCode = async () => {
    setLoading(true);
    try {
      const response = await authApi(access_token).post(
        `${endpoints.EmailConfirm}/get_email/`,
        { email }
      );

      if (response.status === 200) {
        setSnackbarMessage('Mã xác nhận đã được gửi đến email của bạn.');
        setSnackbarVisible(true);
        navigation.navigate("PasswordSubmit",{ email:email })
      }
      else {
        setSnackbarMessage('Đã có lỗi xảy ra khi gửi mã xác nhận.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      if (error.response.status == 429 ) {
        setSnackbarMessage('Mã xác nhận đã được gửi đến email của bạn vui lòng đợi 3 phút để lấy mã mới');
        setSnackbarVisible(true);
        navigation.navigate("PasswordSubmit", { email:email })
      }
      if (error.response) {
        setSnackbarMessage(error.response.data.error || 'Đã có lỗi xảy ra khi gửi mã xác nhận.');
      } else {
        setSnackbarMessage('Đã có lỗi xảy ra khi gửi mã xác nhận.');
      }
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  const handleGoBackToLogin = () => {
    navigation.navigate("Login")
    // Thực hiện điều hướng về trang login tại đây
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Title style={styles.title}>
          Quên mật khẩu
        </Title>
        <Text style={styles.text}>Nhập email của bạn để nhận mã xác nhận</Text>
      </View>
      <View>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={handleSendConfirmationCode}
          loading={loading}
          style={styles.button}
        >
          Gửi mã xác nhận
        </Button>
        <Button
          onPress={handleGoBackToLogin}
          style={styles.button}
        >
          Về lại login
        </Button>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
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
    backgroundColor: '#ffffff',
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  input: {
    width:300

  },
  button: {
    marginTop: 10,
  },
  title:{
    fontWeight:"bold",
    fontSize:25,
    marginBottom: 0,
  },
  text:{
    padding:20,
    fontSize:20,
    color:"gray",
    textAlign:"center",
  },
  info:{
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center',
  }
});

export default PasswordReset;
