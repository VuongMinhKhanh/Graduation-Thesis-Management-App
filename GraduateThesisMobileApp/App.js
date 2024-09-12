import React, { useContext, useReducer } from 'react';
import Login from './components/User/Login';
import { Text, View, ViewComponent, TouchableOpacity } from 'react-native';
import ScoreStats from './components/Thesis/ScoreStats'
import FreqStats from './components/Thesis/FreqStats'
import Theses from './components/Thesis/Theses'
import ThesisDetails from './components/Thesis/ThesisDetails'
import { ActivityIndicator, Badge, Button, Icon, IconButton, Modal, Provider as PaperProvider, Portal, Surface } from 'react-native-paper';
import { DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
// import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MyUnreadMessagesReducer, MyUserReducer } from './configs/Reducers';
import { MyDispatchContext, MyDispatchUnreadMsgContext, MyUnreadMsgContext, MyUserContext } from './configs/Contexts';
import Profile from './components/User/Profile';
import Chat from './components/Chat/Chat';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from "@react-navigation/native"
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import Styles from './components/Chat/Styles';
import { MyAuth } from "./configs/firebase"
import { LogBox } from 'react-native';
import AdminChatList from './components/Chat/AdminChatList';
import HDBVKL from './components/HDBVKL/HDBVKL';
import DetailHDBVKL from './components/HDBVKL/DetailHDBVKL';
import AddHDBVKL from './components/HDBVKL/AddHDBVKL';
import KLTN from './components/KLTN/KLTN';
import AddTheses from './components/KLTN/AddTheses';
import DetailTheses from './components/KLTN/DetailTheses';
import AddGV_huong_dan_KLTN from './components/KLTN/AddGV_huong_dan_KLTN';
import AddTieuChi_KLTN from './components/KLTN/AddTieuChi_KLTN';
import AddHD_KLTN from './components/KLTN/AddHD_KLTN';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminUnreadContext, { AdminUnreadProvider } from './Utils/AdminUnreadContext';
import KLTNGiangVien from './components/KLTN_GiangVien/KLTNGiangVien';
import AddDiem from './components/KLTN_GiangVien/AddDiem';
import ChangePassword from './components/User/ChangePassword';
import PasswordReset from './components/User/PasswordReset/PasswordReset';
import PasswordSubmit from './components/User/PasswordReset/PasswordSubmit';

LogBox.ignoreLogs(['firebase', 'navigate', 'textinput']); // @firebase/auth: Auth (10.12.1):
// You are initializing Firebase Auth for React Native without providing
// AsyncStorage

const theme = {
  ...DefaultTheme,
  // Customize your theme here
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    accent: 'yellow',
    surface: 'rgba(255, 255, 255, 0.5)',
  }
};

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const StatsScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopTab.Navigator
        initialRouteName="ScoreStats"
        screenOptions={{
          tabBarActiveTintColor: '#e91e63',
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: { backgroundColor: 'powderblue' },
        }}
      >
        <TopTab.Screen
          name="ScoreStats"
          component={ScoreStats}
          options={{ tabBarLabel: 'Score Stats' }}
        />
        <TopTab.Screen
          name="FreqStats"
          component={FreqStats}
          options={{ tabBarLabel: 'Frequency Stats' }}
        />
      </TopTab.Navigator>
    </SafeAreaView>
  )
}

const MyTheses = () => {
  return (
    <Stack.Navigator shifting={true} screenOptions={{}}>
      <Stack.Screen name='ThesesList' component={Theses} options={{title: 'Theses', headerTitleAlign: 'center'}} />
      <Stack.Screen name='ThesisDetails' component={ThesisDetails} options={{
        title: 'Thesis Detail',
        }} />
      <Stack.Screen name='AddTheses' component={AddTheses} options={{title: 'Add new Graduation Thesis', headerTitleAlign: 'center'}} />
      <Stack.Screen name='AddGV_huong_dan_KLTN' component={AddGV_huong_dan_KLTN} options={{title: 'Add Instructor', headerTitleAlign: 'center'}} />
      <Stack.Screen name='AddTieuChi_KLTN' component={AddTieuChi_KLTN} options={{title: 'Add Thesis Criteria', headerTitleAlign: 'center'}} />
      <Stack.Screen name='AddHD_KLTN' component={AddHD_KLTN} options={{title: 'Add Council for Thesis', headerTitleAlign: 'center'}} />
      <Stack.Screen name='AddDiem' component={AddDiem} options={{title: 'Adjust Score',}} />
    </Stack.Navigator>
  )
}

const MyCouncil = () => {
  return (
    <Stack.Navigator shifting={true} screenOptions={{}}>
      <Stack.Screen name='HDBVKL' component={HDBVKL} options={{title: 'Council', headerTitleAlign: 'center'}} />
      <Stack.Screen name='DetailHDBVKL' component={DetailHDBVKL} options={{title: 'Council Detail',}} />
      <Stack.Screen name='AddHDBVKL' component={AddHDBVKL} options={{title: 'Add new council',}} />
    </Stack.Navigator>
  )
}

const MyProfile = () => {
  return (
    <Stack.Navigator shifting={true} screenOptions={{}}>
      <Stack.Screen name='Profile' component={Profile} options={{title: 'My Profile', headerTitleAlign: 'center'}} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} options={{title: 'Change Password',}} />
    </Stack.Navigator>
  )
}

const routesConfig = {
  index: 1,
  routes: [
    { key: 'council', title: 'Council', focusedIcon: 'account-supervisor', unfocusedIcon: 'account-supervisor-outline', component: MyCouncil, noHeader: false, studentProhibited: true },
    { key: 'theses', title: 'Theses', focusedIcon: 'book', unfocusedIcon: 'book-outline', component: MyTheses, noHeader: false, studentProhibited: true },
    { key: 'stats', title: 'Stats', focusedIcon: 'chart-bar', unfocusedIcon: 'chart-box', component: StatsScreen, noHeader: false, studentProhibited: true },
    { key: 'thesis', title: 'Thesis', focusedIcon: 'book', unfocusedIcon: 'book-outline', component: ThesisDetails, noHeader: true, studentOnly: true },
    { key: 'profile', title: "My Profile", focusedIcon: 'account', unfocusedIcon: 'account-outline', noHeader: false, component: MyProfile },
  ]
};

const MyTabs = () => {
  const user = useContext(MyUserContext)
  
  return (
    <BottomTab.Navigator
      initialRouteName={routesConfig.routes[routesConfig.index].title}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: '#3e246a',
        tabBarIcon: ({ focused, color }) => {
          const routeInfo = routesConfig.routes.find(r => r.title === route.name);
          const iconName = focused ? routeInfo.focusedIcon : routeInfo.unfocusedIcon;
          return <Icon source={iconName} color={color} size={26} />;
        },
      })}
    >
      {routesConfig.routes.filter(route => {
        // If the user is a student, only show 'thesis' and 'profile' tabs
        if (user && user.current_user.class_name === "SinhVien") {
          return ['thesis', 'profile'].includes(route.key);
        }
        else if (user && user.current_user.class_name === "GiangVien")
          return ['council', 'theses', 'profile'].includes(route.key);
        // Otherwise, show all tabs except 'thesis'
        return route.key !== 'thesis';
      }).map((route) => (
        <BottomTab.Screen
          key={route.key}
          name={route.title}
          component={route.component}
          options={{
            tabBarLabel: route.key === "profile" && user !== null ? (user.current_user.first_name === "" && user.current_user.last_name === "")
              ?user.current_user.username
              :`${user.current_user.first_name} ${user.current_user.last_name}` : route.title,
            headerShown: route.noHeader,
            headerTitleAlign: "center",
          }}
        />
      ))}
    </BottomTab.Navigator>
  );
}

const TabsWithChatButton = () => {
  const navigation = useNavigation();
  const user = useContext(MyUserContext);
  const { adminUnreadCount } = useContext(AdminUnreadContext);

  // Use the adminUnreadCount in your component
  // console.log(`Unread messages in admin chat room: ${adminUnreadCount}`);
  
  return (
    <>
      <MyTabs />
      <View style={Styles.chatContainer}>
        <TouchableOpacity
          onPress={() =>
            user && user.current_user.class_name === ("NguoiDung" || "GiaoVu")
              ? navigation.navigate("Chat", { userChatRoom: "chat_admin@gmail.com_zKrTyYLrAvfamHC07vcDn8oLewl1" }) // navigation.navigate("ChatList", { admin: user })
              : navigation.navigate("Chat", { userChatRoom: "" })
          }
          style={Styles.chatButton}
        >
          <Entypo name="chat" size={24} color="white" />
          {user.current_user.class_name === 'NguoiDung' && adminUnreadCount > 0 && (
            <Badge style={Styles.unreadBadge}>{adminUnreadCount}</Badge>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const ScreenStackChat = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={TabsWithChatButton}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatList"
        component={AdminChatList}
        options={{ title: "Chat List" }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{ headerTitleAlign: "center", title: "Chat Box" }}
      />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
      <Stack.Screen name="PasswordReset" component={PasswordReset} options={{}} />
      <Stack.Screen name="PasswordSubmit" component={PasswordSubmit} options={{}} />
      {/* sign up stack */}
    </Stack.Navigator>
  )
}

const AppStack = () => {
  const user = useContext(MyUserContext)

  return (
    <NavigationContainer>
      {user ? <ScreenStackChat /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  // const [unreadMessages, dispatchUnreadMsg] = useReducer(MyUnreadMessagesReducer, null);
  return (
    <PaperProvider theme={theme}>
      {/* <NavigationContainer> */}
        <MyUserContext.Provider value={user}>
            <MyDispatchContext.Provider value={dispatch}>
              <AdminUnreadProvider>
                <AppStack />
                {/* <PasswordSubmit /> */}
              </AdminUnreadProvider>
            </MyDispatchContext.Provider>
        </MyUserContext.Provider>
      {/* </NavigationContainer> */}
    </PaperProvider>
  );
}