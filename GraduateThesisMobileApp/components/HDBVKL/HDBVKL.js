import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Text, Title } from "react-native-paper";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import moment from "moment";
import { isCloseToBottom } from "../../Utils/Utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownSearchBar from "../../Utils/DropDownSearchBar";
import { MyUserContext } from "../../configs/Contexts";

const HDBVKL = ({ navigation }) => {
    const [HDBVKL, setHDBVKL] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const addNewHDBVKL = (newHDBVKL) => {
        setHDBVKL((prevCouncils) => [newHDBVKL, ...prevCouncils]);
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            let access_token = await AsyncStorage.getItem('token')
            let res = await authApi(access_token).get(`${endpoints['HDBVKL']("")}&page=${1}`);
            setHDBVKL(res.data.results);
            setNextPage(res.data.next);
            setPage(2); // Set to the next page to load on scroll
        } catch (ex) {
            console.error(ex);
        } finally {
            if (isRefreshing) setRefreshing(false);
            else setLoading(false);
        }
    };

    const loadMoreHDBVKL = async () => {
        if (nextPage) {
            setLoading(true);
            try {
                let res = await APIs.get(nextPage);
                setHDBVKL(current => [...current, ...res.data.results]);
                setNextPage(res.data.next);
                setPage(page + 1);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleScroll = ({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent) && !loading) {
            loadMoreHDBVKL();
        }
    };

    const toggleStatus = async (id) => {
        try {
            let access_token = await AsyncStorage.getItem('token')
            let res = await authApi(access_token).patch(`${endpoints['HDBVKL']}${id}/trang_thai_hdbvkl/`);
            if (res.status === 200) {
                setHDBVKL(HDBVKL.map(hd => hd.id === id ? {...hd, trang_thai: !hd.trang_thai} : hd));
            }
        } catch (error) {
            console.error(error);
        }
    };
    const user = useContext(MyUserContext)
    const lec_privilege = user.current_user.class_name === "GiangVien"
    React.useEffect(() => {
        if (!lec_privilege)
            navigation.setOptions({
                headerRight: () => (
                    <IconButton icon="account-plus" size={28} iconColor="red" 
                    onPress={() => navigation.navigate("AddHDBVKL", { addNewHDBVKL })}
                    ></IconButton>
                )
            });
    }, [navigation]);


    return (
        <View style={styles.container}>
            <DropDownSearchBar setCouncil={setHDBVKL} itemName={"Tìm kiếm hội đồng"} iconName={"search1"}/>
            {loading && HDBVKL.length === 0 ? (
                <ActivityIndicator size="large" color="#6200ee" />
            ) : (
                HDBVKL.length === 0 
                ? <View style={styles.noCouncilContainer}>
                    <Text style={styles.noCouncilText}>No council available for the selected lecturer.</Text>
                </View>
                :
                <ScrollView
                    onScroll={handleScroll}
                    refreshControl={
                        <RefreshControl onRefresh={loadData} refreshing={refreshing} />
                    }
                >
                    {HDBVKL.map(hd => (
                        <Card
                            key={hd.id}
                            style={styles.card}
                            onPress={() => navigation.navigate("DetailHDBVKL", { hdbvkl: hd })}
                        >
                            <Card.Content style={styles.column}>
                                <Title>{`Hội đồng ${hd.id}`}</Title>
                                <Text>{moment(hd.created_date).fromNow()}</Text>
                                {!lec_privilege && <Button onPress={() => toggleStatus(hd.id)}>{hd.trang_thai ? "Khóa" : "Mở"}</Button>}
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            )}
            {/* <Button
                mode="contained"
                onPress={() => navigation.navigate("AddHDBVKL", { addNewHDBVKL })}
                style={styles.button}
            >
                Thêm hội đồng bảo vệ khóa luận
            </Button> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    card: {
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
        padding: 10,
    },
    column: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    noCouncilContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    noCouncilText: {
    fontSize: 16,
    color: '#888',
    },
    
});

export default HDBVKL;
