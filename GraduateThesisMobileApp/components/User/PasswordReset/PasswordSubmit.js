import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Snackbar, Title, Text } from 'react-native-paper';
import APIs, { endpoints } from '../../../configs/APIs'; // Đường dẫn tới file API.js
import { useRoute } from '@react-navigation/native';
const PasswordSubmit = ({ navigation }) => {
  const route = useRoute()
  const {email} = route.params
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const handleSendConfirmationCode = async () => {
    setLoading(true);
    try {
      const response = await APIs.post(
        `${endpoints.EmailConfirm}/get_email/`,
        { email }
      );

      if (response.status === 200) {
        setSnackbarMessage('Mã xác nhận đã được gửi đến email của bạn.');
        setSnackbarVisible(true);
      }
      else {
        setSnackbarMessage('Đã có lỗi xảy ra khi gửi mã xác nhận.');
        setSnackbarVisible(true);
      }
    } catch (error) {
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
  const handleChangePassword = async () => {
    if (confirmationCode==='') {
        setSnackbarMessage('Mã xác nhận không được để trống.');
        setSnackbarVisible(true);
        return;
      }
    if (newPassword==='' || confirmPassword==='') {
        setSnackbarMessage('Mật khẩu mới không được để trống.');
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
      const response = await APIs.post(
        `${endpoints.EmailConfirm}/validate_email_to_change_password/`,
        {
          email:email,
          ma_xac_nhan: confirmationCode,
          new_password: newPassword,
        }
      );

      if (response.status === 200) {
        setSnackbarMessage('Mật khẩu đã được thay đổi thành công.');
        setSnackbarVisible(true);
        // Có thể thực hiện điều hướng tới màn hình thành công hoặc màn hình đăng nhập ở đây
      } else {
        setSnackbarMessage('Đã có lỗi xảy ra khi thay đổi mật khẩu.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      if (error.response) {
        setSnackbarMessage(error.response.data.error || 'Đã có lỗi xảy ra khi thay đổi mật khẩu.');
      } else {
        setSnackbarMessage('Đã có lỗi xảy ra khi thay đổi mật khẩu.');
      }
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  const handleGoBackToLogin = () => {
    // console.log("Về lại trang login");
    navigation.navigate("Login")
    // Thực hiện điều hướng về trang login tại đây
  };
  useEffect(() => {
    }, []);
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Title style={styles.title}>
          Đặt lại mật khẩu
        </Title>
      </View>
      <View>
        <TextInput
          label="Mã xác nhận"
          value={confirmationCode}
          onChangeText={(text) => setConfirmationCode(text)}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Nhập mật khẩu mới"
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          style={styles.input}
          mode="outlined"
          secureTextEntry={isPasswordSecure}
          right={
            <TextInput.Icon
            icon={isPasswordSecure ? "eye": "eye-off"} 
              onPress={() => { isPasswordSecure ? setIsPasswordSecure(false) : setIsPasswordSecure(true) }}
            />
          }
        />
        <TextInput
          label="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          style={styles.input}
          mode="outlined"
          secureTextEntry={isConfirmPasswordSecure}
          right={
            <TextInput.Icon
            icon={isConfirmPasswordSecure ? "eye": "eye-off"} 
              onPress={() => { isConfirmPasswordSecure ? setIsConfirmPasswordSecure(false) : setIsConfirmPasswordSecure(true) }}
            />
          }
        />
        <Button
          mode="contained"
          onPress={handleChangePassword}
          loading={loading}
          style={styles.button}
        >
          Xác nhận
        </Button>
        <Button
          mode="outlined"
          onPress={handleSendConfirmationCode}
          loading={loading}
          style={styles.button}
        >
          Gửi lại mã xác nhận
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
    width:300,
    marginBottom:10
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

export default PasswordSubmit;
