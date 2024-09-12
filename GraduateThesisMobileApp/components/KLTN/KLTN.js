import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Button, Text, Card, Title, Searchbar } from "react-native-paper";
import APIs, { endpoints, addTheses } from "../../configs/APIs";
import moment from 'moment';
import { isCloseToBottom } from "../../Utils/Utils"; // Giả sử hàm này đã có sẵn

const KLTN = ({ navigation }) => {
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            let res = await APIs.get(`${endpoints['theses']}?page=${1}&ten_khoa_luan=${searchQuery}`);
            setTheses(res.data.results);
            setNextPage(res.data.next);
            setPage(2); // Set to the next page to load on scroll
        } catch (ex) {
            console.error(ex);
        } finally {
            if (isRefreshing) setRefreshing(false);
            else setLoading(false);
        }
    };

    const loadMoreTheses = async () => {
        if (nextPage) {
            setLoading(true);
            try {
                let res = await APIs.get(nextPage);
                setTheses(current => [...current, ...res.data.results]);
                setNextPage(res.data.next);
                setPage(page + 1);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [searchQuery]);

    const handleScroll = ({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent) && !loading) {
            loadMoreTheses();
        }
    };

    const addThesis = async (thesis) => {
        try {
            const res = await addTheses(thesis);
            if (!res.error) {
                setTheses([res, ...theses]);
            }
            return res;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Trang quản lý khóa luận tốt nghiệp</Title>
            <Searchbar
                style={styles.searchBar}
                placeholder="Nhập tên khóa luận"
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            {theses.length === 0 && loading ? (
                <ActivityIndicator />
            ) : (
                <ScrollView
                    onScroll={handleScroll}
                    refreshControl={
                        <RefreshControl onRefresh={() => loadData(true)} refreshing={refreshing} />
                    }
                >
                    {theses.map(item => (
                        <Card
                            key={item.id}
                            style={styles.card}
                            onPress={() => navigation.navigate("DetailTheses", { thesis: item })}
                        >
                            <Card.Content style={styles.column}>
                                <View>
                                    <Title>{item.id} - {item.ten_khoa_luan}</Title>
                                </View>
                                <View>
                                    <Text>{moment(item.created_date).fromNow()}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            )}
            {loading && nextPage && <ActivityIndicator />}
            <Button
                mode="contained"
                onPress={() => navigation.navigate("AddTheses", { addThesis })}
                style={styles.button}
            >
                Thêm khóa luận
            </Button>
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
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    card: {
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
    },
    column: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    searchBar: {
        marginBottom: 10,
    },
});

export default KLTN;
