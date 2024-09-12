import { View, Text, Image, SafeAreaView, TouchableOpacityBase, TouchableOpacity, Alert, LogBox, Keyboard } from "react-native";
import { ActivityIndicator, Button, HelperText, Icon, IconButton, TextInput } from "react-native-paper";
import React, { useContext } from "react";
import APIs, { BASE_URL, authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext } from "../../configs/Contexts";
import Styles from "./Styles";
import { signInWithEmailAndPassword } from "firebase/auth";
import { MyAuth } from "../../configs/firebase";
import DropDown from "react-native-paper-dropdown";

LogBox.ignoreLogs(['defaultProps']); // 

const BackImage = require("../../assets/present_2.jpg")

const Login = () => {
    const [user, setUser] = React.useState({});
    const [fields, setFields] = React.useState([
        {
            "label": "Tên đăng nhập",
            "icon": "account",
            "name": "username",
        },
        { 
            name: 'password', 
            label: 'Password', 
            secureTextEntry: true, 
            icon: 'eye' 
        }
    ])
    // const fields = [{
    //     "label": "Tên đăng nhập",
    //     "icon": "account",
    //     "name": "username",
    // }, {
    //     "label": "Mật khẩu",
    //     "icon": "eye",
    //     "name": "password",
    //     "secureTextEntry": true,
    // }];
    const [loading, setLoading] = React.useState(false);
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);

    // const [err, setErr] = React.useState(false);

    const updateState = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    const [showDropDown, setShowDropDown] = React.useState(false);
    const [role, setRole] = React.useState("")
    const roleList = [
        {
          label: "Student",
          value: "student",
        },
        {
          label: "Lecturer",
          value: "lecturer",
        },
        {
          label: "Faculty Officer",
          value: "officer",
        },
        {
          label: "Admin",
          value: "admin",
        },
    ];

    const login = async () => {
        Keyboard.dismiss()
        // console.log(user.username, user.password)
        // if (!(user.username !== "" && user.password !== "") 
        //     || user.username === undefined 
        //     || user.password === undefined)
        // {
        //     Alert.alert("Field missing!", "Please fill in username and password")
        //     return;
        // }
        setLoading(true);
        try {
            let username = user.username;
            let password = user.password;
            // let username = "admin";
            // let password = "123456";
            const client_id = "P7F2Can5D4odfSBJiXXY9oWZib8JRh6jvC5TaqSy" //  'NmvFSir1yfbpoN50RPkVrj4ihDQfHfANLxm2AK7i'; // 
            const client_secret = "H3HKucdQ6KQ1Xl3WJVmwRh9NkG2I42ElsUS6S6yC9g2LNXD7e8xvxX7KtkAzTw0JDdMLSNmImUu7XW7buxhlYy67EosNJML5Q8YsuTayDtm4sN0TQbcxipt1poaPjIQp" //  'QKKu0sRz0Nf05Jb6T0mxnZbJ5IcyeOq5X7PHYhDlr9yYM4oyrdnjrJw5fvzi1MAVP73TgMWQi8Ry5yaj3LudlrPxW1IUpWRRzSqf2ZYJ5yP9qki0KXuZFFkLMRQQVrwx'; // 
            const grant_type = 'password';

            // URL của token endpoint
            const url = 'http://hoangila2016.pythonanywhere.com/o/token/';
            // const url = 'http://192.168.0.100:8000/o/token/';
            // console.info(url)

            // Dữ liệu gửi trong yêu cầu POST
            const data = new URLSearchParams({
                grant_type: grant_type,
                username: username,
                password: password,
                // ...user,
                client_id: client_id,
                client_secret: client_secret
            });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data.toString()
            });

            const result = await response.json();
                
            await AsyncStorage.setItem("token", result.access_token);
            
            const getCurrentUserAPI = async () => {
                let currentUserAPI;
                if (role === "student") {
                  currentUserAPI = "http://hoangila2016.pythonanywhere.com/sinh_vien/current-user/";
                } else if (role === "lecturer") {
                  currentUserAPI = "http://hoangila2016.pythonanywhere.com/giang_vien/current-user/";
                } else if (role === "officer") {
                  currentUserAPI = "http://hoangila2016.pythonanywhere.com/giao_vu/current-user/";
                } else 
                  currentUserAPI = "http://hoangila2016.pythonanywhere.com/users/current-user/";

                return currentUserAPI;
            };
            
            setTimeout(async () => {
                try {
                // let user = await authApi(result.access_token).get(endpoints['current-user']);
                
                // console.info("user data", user.data);
                // setRole("student")
                const currentUserAPI = await getCurrentUserAPI();

                // console.log(role, currentUserAPI)
                const userResponse = await fetch(currentUserAPI, { //  http://192.168.0.105:8000/users/current-user/
                    headers: {
                        'Authorization': `Bearer ${result.access_token}`
                    }
                });
                const userData = await userResponse.json();

                // firebase login
                const signInUser = async () => {
                    try {
                        if (!username.endsWith("@gmail.com"))
                            username = `${username}@gmail.com`;

                        if (password === "123")
                            password = `${password}456`;

                        const userCredential = await signInWithEmailAndPassword(MyAuth, username, password);
                        // console.info("user credential", userCredential.user)
                        await dispatch({ 
                            type: 'login', 
                            payload: {["current_user"]: userData, ...userCredential.user} }
                        );
                        // console.info("final user data", user)
                        } catch (error) {
                            console.error('Error signing in:', error);
                        }
                    };
                    signInUser();
                    // nav.navigate('ScreenStackChat');
                } catch (error) {
                    // console.error('Error fetching user data:', error);
                    Alert.alert('Invalid role', 'Please select a valid role.');
                    setLoading(false)
                }
                }, 100);
        } catch (ex) {
            Alert.alert("Incorrect login", "Wrong username or password")
            // console.error(ex);
            setLoading(false);
        } finally {
            // setLoading(false);
        }   
    }
    const toggleSecureEntry = (fieldName) => {
        if (fieldName === 'password') {
            setFields(
              fields.map((field) =>
                field.name === fieldName
                  ? { ...field, secureTextEntry: !field.secureTextEntry }
                  : field
                )
            );
        }
    };

    return (
        <View style={[Styles.container]}>
            <Image source={BackImage} style={Styles.backImage}/>
            <View style={Styles.whiteSheet}>
            <SafeAreaView style={Styles.form}>
                <Text style={Styles.title}>Login</Text>
                <DropDown 
                    label={"Role"}
                    mode={"outlined"}
                    visible={showDropDown}
                    showDropDown={() => setShowDropDown(true)}
                    onDismiss={() => setShowDropDown(false)}
                    value={role}
                    setValue={setRole}
                    list={roleList}
                    inputProps={{
                        style:{
                            margin: 10,
                            height: 50,
                            fontSize: 16,
                            borderRadius: 10,
                            paddingLeft: 12,
                        }
                    }}
                />
                {fields.map(c => <TextInput style={Styles.input} secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateState(c.name, t)}
                key={c.name} label={c.label} 
                right={<TextInput.Icon icon={c.name==="password" 
                ? (c.secureTextEntry ? 'eye' : 'eye-off') 
                : c.icon} style={{marginTop: 35}} onPress={() => toggleSecureEntry(c.name)} />} />)}
                
                <TouchableOpacity style={Styles.button} onPress={login}>
                    <Text style={Styles.login}>Log in</Text>
                </TouchableOpacity>
                <HelperText type="info" style={Styles.helperText} onPress={() => nav.navigate("PasswordReset")}>
                        Reset mật khẩu
                </HelperText>
                {loading && <ActivityIndicator style={{marginTop: 10}}/>}
            </SafeAreaView>
            </View>
            {/* <Button icon="account" loading={loading} mode="contained" onPress={login}>ĐĂNG NHẬP</Button> */}
        </View>
    );
}

export default Login;