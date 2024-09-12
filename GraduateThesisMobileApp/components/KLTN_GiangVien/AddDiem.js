import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from "react-native";
import { Button } from "react-native-paper";

const AddDiem = ({ route }) => {
    const { thesis } = route.params;
    const [diemList, setDiemList] = useState([]);
    
    useEffect(() => {
        const fetchDiem = async () => {
            try {
                let access_token = await AsyncStorage.getItem('token')
                const response = await fetch(`http://hoangila2016.pythonanywhere.com/KLTN/${thesis.id}/diem/`, {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
                const data = await response.json();
                setDiemList(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching diem:", error);
            }
        };

        fetchDiem();
    }, [thesis.id]);

    const handleSave = async () => {
        for (let item of diemList) {
            if (item.diem < 0 || item.diem > 10) {
                Alert.alert('Error', 'Điểm phải nằm trong khoảng từ 0 đến 10.');
                return;
            }

            if (item.id !== 0) {
                if (item.diem !== '')
                try {
                    let access_token = await AsyncStorage.getItem('token')
                    const response = await fetch(`http://hoangila2016.pythonanywhere.com/Diem/${item.id}/update/`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${access_token}`
                        },
                        body: JSON.stringify({
                            diem: item.diem
                        })
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        Alert.alert('Error', data.error || 'Có lỗi xảy ra.');
                        return;
                    }

                } catch (error) {
                    console.error("Error updating diem:", error);
                    Alert.alert('Error', 'Có lỗi xảy ra.');
                }
                else
                {
                    Alert.alert('Error', 'Điểm sửa không được để trống');
                    return;
                }
            } 
            else {
                console.info(item.diem)
                if (item.diem !== 'Chưa có' && item.diem !== '' ) 
                    {
                        try {
                            let access_token = await AsyncStorage.getItem('token')
                            const response = await fetch("http://hoangila2016.pythonanywhere.com/Diem/add/", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${access_token}`
                                },
                                body: JSON.stringify({
                                    kltn: thesis.id,
                                    diem: item.diem,
                                    tieuchi: item.tieu_chi.id
                                })
                            });
        
                            if (response.status !== 201) {
                                const data = await response.json();
                                Alert.alert('Error', data.error || 'Có lỗi xảy ra.');
                                return;
                            }
        
                        } catch (error) {
                            console.error("Error adding diem:", error);
                            Alert.alert('Error', 'Có lỗi xảy ra.');
                        }
                    }
                }
        }
        Alert.alert('Success', 'Điểm đã được lưu thành công.');
    };

    const handleInputChange = (value, index) => {
        const updatedDiemList = [...diemList];
        updatedDiemList[index].diem = value;
        setDiemList(updatedDiemList);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{thesis.ten_khoa_luan}</Text>
            <ScrollView>
                {diemList.map((item, index) => (
                    <View key={item.tieu_chi.id} style={styles.diemItem}>
                        <Text style={styles.tieuChi}>{item.tieu_chi.tieu_chi} - {item.tieu_chi.ty_le}</Text>
                        <TextInput
                            style={styles.diem}
                            keyboardType="numeric"
                            value={item.diem === "Chưa có" ? '' : item.diem.toString()}
                            onChangeText={(value) => handleInputChange(value, index)}
                        />
                    </View>
                ))}
                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                    Lưu
                </Button>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    diemItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    tieuChi: {
        flex: 1,
        marginRight: 10,
    },
    diem: {
        flex: 1,
        marginRight: 10,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 5,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 5,
        padding: 8,
    },
});

export default AddDiem;
