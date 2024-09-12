import { View, Text, TouchableOpacity, TouchableHighlight, ActivityIndicator, RefreshControl } from "react-native"
import MyStyles from "../../styles/MyStyles"
import React, { useContext } from "react"
import { Avatar, Button, Card, Dialog, FAB, Icon, IconButton, List, Paragraph, Portal, Searchbar, Title, Tooltip, TouchableRipple } from "react-native-paper"
import APIs, { addTheses, authApi, endpoints } from "../../configs/APIs";
import moment from "moment";
import { ScrollView } from "react-native";
import { isCloseToBottom } from "../../Utils/Utils";
import ChangeThesisStatusButton from "../../Utils/ChangeThesisStatusButton";
import { LogBox } from 'react-native';
import { MyUserContext } from "../../configs/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bubble } from "react-native-gifted-chat";

LogBox.ignoreLogs([
  'Possible unhandled promise rejection',
  'Deprecation warning'
]);

const Theses = ({ navigation }) => {
    const [theses, setTheses] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    // const [keyword, setKeyword] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [refreshing, setRefreshing] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const user = useContext(MyUserContext)
    const lec_privilege = user.current_user.class_name === "GiangVien"

    const addNewThesis = (newThesis) => {
        setTheses((prevTheses) => [newThesis, ...prevTheses]);
    }

    const loadData = async () => {
        if (refreshing) 
            setRefreshing(true);
        else 
            setLoading(true);

        try {
            setLoading(true)
            let access_token = await AsyncStorage.getItem('token')
            // let res = await authApi(access_token).get(endpoints['theses'])
            let lec_id_query = ""
            if (lec_privilege)
                lec_id_query = "&lec_id=" + user.current_user.pk

            let res = await authApi(access_token).get(`${endpoints['theses']}?page=${1}&ten_khoa_luan=${searchQuery}${lec_id_query}`);
            setTheses(res.data.results);
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadData()
    }, [searchQuery])

    const loadTheses = async () => {
        if (page > 0) {
            let url
            if (lec_privilege)
                url = `${endpoints['theses']}?ten_khoa_luan=${searchQuery}&page=${page}&lec_id=${user.current_user.pk}`;
            else
                url = `${endpoints['theses']}?ten_khoa_luan=${searchQuery}&page=${page}`;
            try {
                setLoading(true);
                let access_token = await AsyncStorage.getItem('token')
                let res = await authApi(access_token).get(url);

                if (page === 1)
                    setTheses(res.data.results);
                else if (page > 1)
                    setTheses(current => {
                        return [...current, ...res.data.results] // remember to add results after pagination
                    });
                if (res.data.next === null)
                    setPage(0);
            } catch (ex) {
                console.error(ex);
            } finally {
                if (refreshing) 
                    setRefreshing(false);
                else 
                    setLoading(false);
            }
        }
    }

    React.useEffect(() => {
        loadTheses();
        // console.log("more theses loaded")
    }, [searchQuery, page]);

    const loadMoreTheses = ({nativeEvent}) => {
        if (searchQuery.length === 0 && loading===false && isCloseToBottom(nativeEvent)) {
            setPage(page + 1);
            // console.log("load more")
        }
    }

    // const addThesis = async (thesis) => {
    //     try {
    //         const res = await addTheses(thesis); // not authorized yet
    //         if (!res.error) {
    //             setTheses([res, ...theses]);
    //         }
    //         return res;
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // };

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                !lec_privilege && <IconButton icon="book-plus" size={28} iconColor="red" 
                onPress={() => navigation.navigate("AddTheses", { addNewThesis })}
                ></IconButton>
            )
        });
    }, [navigation, addNewThesis, ]);

    const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

    return (
        <View>
            <ScrollView contentContainerStyle={MyStyles.container} onScroll={loadMoreTheses}
            refreshControl={
                <RefreshControl refreshing={refreshing} 
                onRefresh={loadTheses}
                elevation={10}
                />
            }
            >
                <Searchbar
                    style={MyStyles.searchBar}
                    placeholder="Nhập tên khóa luận"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
                {theses.length === 0 && loading ? (
                    <ActivityIndicator />
                ) :
                <View>
                    {theses.map(item => (
                            <TouchableRipple
                                key={item.id}
                                onPress={() => navigation.navigate("ThesisDetails", { "thesisId": item.id, 
                                "thesisStatus": item.trang_thai, 
                                "setTheses": setTheses })}
                                style={MyStyles.touchableStyle}
                            >
                                <Card 
                                style={MyStyles.margin}>
                                    <Card.Content LeftContent={LeftContent}>
                                        <Title style={{textAlign: "center"}}>
                                            {item.ten_khoa_luan}
                                        </Title>
                                        <Paragraph>
                                                Created on: {moment(item.created_date).fromNow()}
                                        </Paragraph>
                                        <Paragraph>
                                            Average scores: {item.diem_tong || 'N/A'}
                                        </Paragraph>
                                        <Paragraph>
                                            Plagiarism: {item.ty_le_dao_van}%
                                        </Paragraph>
                                    </Card.Content>
                                    <Card.Actions>
                                    {user.current_user.class_name !== "GiangVien" 
                                    ?<ChangeThesisStatusButton 
                                        thesisId={item.id} 
                                        status={item.trang_thai}
                                        loading={loading} 
                                        setTheses={setTheses}
                                    />
                                    :<Button
                                        mode={item.trang_thai ? 'contained' : 'contained-tonal'}
                                        disabled={loading}
                                    >
                                        {item.trang_thai ? 'In Progress' : 'Concluded'}
                                    </Button>}
                                    </Card.Actions>
                                </Card>
                            </TouchableRipple>
                        ))
                    }
                    
                </View>}
            </ScrollView>
            {loading && page > 1 && <ActivityIndicator/>}
            {/* <Button
                mode="contained"
                onPress={() => navigation.navigate("AddTheses", { addThesis })}
                style={[MyStyles.addThesisButton, {marginHorizontal: "auto", marginVertical: 10}]}
            >
                Thêm khóa luận
            </Button> */}
        </View>
    )
}

export default Theses