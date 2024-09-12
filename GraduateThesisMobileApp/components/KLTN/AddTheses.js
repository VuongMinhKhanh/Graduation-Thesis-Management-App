import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, TextInput, Text, Title } from "react-native-paper";
import DropDownSearchBar from "../../Utils/DropDownSearchBar";
import { addTheses, authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddTheses = ({ navigation, route }) => {
    const { addNewThesis } = route.params;
    const [thesisData, setThesisData] = useState({
        ten_khoa_luan: "",
        ty_le_dao_van: 0,
        diem_tong: 0,
        mssv: [{ mssv: "" }],
    });
    const [message, setMessage] = useState("");

    const handleAddMssv = () => {
        if (thesisData.mssv.length >= 2) {
            Alert.alert("Maximum of students is 2")
            return
        }

        setThesisData({
            ...thesisData,
            mssv: [...thesisData.mssv, { mssv: "" }],
        });
    };

    const handleInputChange = (name, value) => {
        setThesisData({ ...thesisData, [name]: value });
    };

    const handleMssvChange = (index, value) => {
        if (!isNaN(value)) {
            const newMssv = thesisData.mssv.slice();
            newMssv[index].mssv = value;
            setThesisData({ ...thesisData, mssv: newMssv });
        }
    };

    const handleSubmit = async () => {
        if (!thesisData.ten_khoa_luan.trim()) {
            setMessage("Tên Khóa Luận không được trống");
            return;
        }
        else
            setMessage("");
        
        // const emptyMssvIndex = thesisData.mssv.findIndex((mssv) => !mssv.mssv.trim());
        const studentIsChosen = thesisData.mssv.map((mssv) => {
            if (mssv.mssv !== "")
                return true
        })

        if (studentIsChosen.length === 0) {
            setMessage("MSSV không được trống");
            return;
        }
        else 
            setMessage("");

        try {
            let access_token = await AsyncStorage.getItem('token')
            // const response = await authApi(access_token).addTheses(thesisData);
            const response = await authApi(access_token).post(endpoints["addTheses"], thesisData);

            //console.info(response.data)
            if (response.data.error) {
                setMessage(response.error);
            } else {
                setMessage("Thêm thành công!");
                addNewThesis(response.data)
                setTimeout(() => {
                    navigation.goBack();
                }, 100)
            }
        } catch (error) {
            console.error(error)
            setMessage(error);
        }
    };

    return (
        <KeyboardAwareScrollView style={styles.container} extraHeight={120}>
            <View>
                {/* <Title style={styles.title}>Thêm Khóa Luận</Title> */}
                <TextInput
                    label="Tên Khóa Luận"
                    value={thesisData.ten_khoa_luan}
                    onChangeText={(text) => handleInputChange("ten_khoa_luan", text)}
                    style={styles.input}
                />
                <TextInput
                    label="Tỷ Lệ Đạo Văn"
                    value={thesisData.ty_le_dao_van}
                    onChangeText={(text) => handleInputChange("ty_le_dao_van", parseFloat(text))}
                    style={styles.input}
                    keyboardType="numeric"
                />
                {thesisData.mssv.map((mssv, index) => (
                    <DropDownSearchBar setStudentId={(text) => handleMssvChange(index, text)} itemName={"Tìm sinh viên"} iconName={"adduser"} />
                ))}
                <Button mode="outlined" onPress={handleAddMssv} style={styles.button}>
                    Thêm MSSV
                </Button>
                {message ? <Text style={styles.error}>{message}</Text> : null}
                <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    Xác Nhận
                </Button>
            
            </View>
        </KeyboardAwareScrollView>
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
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
});

export default AddTheses;
