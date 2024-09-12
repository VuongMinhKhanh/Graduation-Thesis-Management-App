import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, Title, Searchbar } from "react-native-paper";
import moment from 'moment';
import { MyUserContext } from "../../configs/Contexts";

const KLTNGiangVien = ({ navigation }) => {
    const tokenGiangVien ="nzV4dJ2X5MBTUUQUQoXbc1E7AOf2Mq"; //để tạm khi nào có chứng thực thì bỏ vào
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const user = useContext(MyUserContext)
    // console.log(user.current_user.pk)
    useEffect(() => {
        loadData();
    }, [searchQuery]);

    const loadData = async () => {
        setLoading(true);
        try {
            const url = `http://hoangila2016.pythonanywhere.com/giang_vien/${user.current_user.pk}/kltn/?kw=${searchQuery}`;
            const config = {
                headers: {
                    Authorization: `Bearer ${tokenGiangVien}`
                }
            };

            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error('Request failed with status ' + response.status);
            }

            const data = await response.json();
            setTheses(data.results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        // Handle scroll if needed
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
            {loading ? (
                <ActivityIndicator size="large" color="#6200ee" />
            ) : (
                <ScrollView onScroll={handleScroll}>
                    {theses.map(item => (
                        <Card
                            key={item.id}
                            style={styles.card}
                            onPress={() => navigation.navigate("AddDiem", { thesis: item })}
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
        alignItems: 'center'
    },
    searchBar: {
        marginBottom: 10
    }
});

export default KLTNGiangVien;
