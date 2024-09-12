import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Title, Button, ActivityIndicator, Avatar, List, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import APIs, { authApi, endpoints } from "../../configs/APIs"; // Đường dẫn tới file API.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';

const userToken = 'x4dgJtWn0FG5g9QFfRhgxAEKYXkuGw'; // Đảm bảo khai báo const

const Profile = ({ navigation }) => {
    // const [user, setUser] = useState(null);
    const [user, setUser] = useState(useContext(MyUserContext))
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [access_token, setAccessToken] = useState('');
    const [avatar, setAvatar] = useState(user.current_user.avatar);
    const dispatch = useContext(MyDispatchContext);

    useEffect(() => {
        const loadToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setAccessToken(token);
        }
        loadToken()
    }, [])

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <IconButton
                  icon="logout" 
                  size={26} 
                  onPress={() => dispatch({"type": "logout"})}
                  style={Styles.logout}
                  iconColor='red'
                  // do I need some logout transition?
                />
            )
        })
    })

    // useEffect(() => {
    //     const loadProfileUser = async () => {
    //         try {
    //             let access_token = await AsyncStorage.getItem('token')
    //             let res = await authApi(access_token).get(`${endpoints['NguoiDung']}/current-user/`, {
    //                 headers: {
    //                     'Authorization': `Bearer ${userToken}`
    //                 }
    //             });
    //             setUser(res.data);
    //         } catch (error) {
    //             console.error("Error loading profile user:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     loadProfileUser();
    // }, []);

    const handleChooseAvatar = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("You've refused to allow this app to access your photos!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!pickerResult.canceled) {
            handleUploadAvatar(pickerResult.assets[0]);
        }
    };

    const handleUploadAvatar = async (avatar) => {
        const formData = new FormData();
        formData.append('avatar', {
            uri: avatar.uri,
            type: 'image/jpeg', // Bạn có thể thay đổi type này nếu cần thiết
            name: avatar.fileName, // Lấy tên file từ URI
        });

        setUploading(true);

        try {
            let res = await APIs.patch(`${endpoints.NguoiDung}/change-avatar/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (res.status === 200) {
                setUser({ ...user, avatar: res.data.avatar });
                setAvatar(res.data.avatar)
                Alert.alert("Success", "Avatar changed successfully");
            } else {
                Alert.alert("Error", "Failed to change avatar");
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            Alert.alert("Error", "An error occurred while changing the avatar. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#6200ee" style={Styles.loading} />;
    }

    return (
        <ScrollView contentContainerStyle={[Styles.container, {flex: 0}]}>
            <Image source={{ uri: avatar }} style={Styles.avatar}/>
            <TouchableOpacity onPress={handleChooseAvatar} style={Styles.changeAvatar}>
                <Avatar.Icon size={35} icon={'camera'} />
            </TouchableOpacity>
            <Title style={[Styles.text]}>{(user.current_user.first_name === "" || user.current_user.first_name === undefined && user.current_user.last_name === "" || user.current_user.last_name === undefined)
                ?user.current_user.username
                :`${user.current_user.first_name} ${user.current_user.last_name}`}
            </Title>
            <Text style={Styles.email}>{user.current_user.email}</Text>
            <Card style={Styles.card}>
                <Card.Title title="Account" />
                    <Card.Content>
                        <List.Item
                            title="Profile"
                            left={(props) => <List.Icon {...props} icon="account-circle" />}
                            onPress={() => console.log('hiện profile')}
                        />
                        <List.Item
                            title="Đổi mật khẩu"
                            left={(props) => <List.Icon {...props} icon="lock" />}
                            onPress={() => navigation.navigate("ChangePassword")}
                        />
                    </Card.Content>
            </Card>
            <Card style={Styles.card}>
                <Card.Title title="Settings" />
                <Card.Content>
                    <List.Item
                        title="Notifications"
                        left={(props) => <List.Icon {...props} icon="bell" />}
                        onPress={() => console.log('Pressed Notifications')}
                    />
                    <List.Item
                        title="Preferences"
                        left={(props) => <List.Icon {...props} icon="account-settings" />}
                        onPress={() => console.log('Pressed Preferences')}
                    />
                </Card.Content>
            </Card>
            {uploading && <ActivityIndicator size="large" color="#6200ee" style={Styles.uploadingIndicator} />}
        </ScrollView>
    );
};

export default Profile;
