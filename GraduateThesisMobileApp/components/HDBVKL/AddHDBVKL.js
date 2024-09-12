import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Keyboard } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownSearchBar from "../../Utils/DropDownSearchBar";

const AddHDBVKL = ({ navigation, route }) => {
    const { addNewHDBVKL } = route.params;
    const [hdbvkl, setHDBVKL] = useState({
        gv_phan_bien: "",
        chu_tich: "",
        thu_ky: "",
        thanh_vien: [],
        ngay_bao_ve: ""
    });
    const [message, setMessage] = useState("");

    const handleAddMember = () => {
        if (hdbvkl.thanh_vien.length >= 2) {
            Alert.alert("Maximum of members is 5")
            return
        }
        setHDBVKL({
            ...hdbvkl,
            thanh_vien: [...hdbvkl.thanh_vien, ""],
        });
    };

    const handleInputChange = (name, value) => {
        setHDBVKL({ ...hdbvkl, [name]: value });
    };

    const handleMemberChange = (index, value) => {
        const newMember = hdbvkl.thanh_vien.slice();
        newMember[index] = value;
        setHDBVKL({ ...hdbvkl, thanh_vien: newMember });
    };

    const handleRemoveMember = (index) => {
        const newMember = hdbvkl.thanh_vien.slice();
        newMember.splice(index, 1);
        setHDBVKL({ ...hdbvkl, thanh_vien: newMember });
    };

    const validateDate = (date) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(date);
    };

    const handleSubmit = async () => {
        if (!validateDate(hdbvkl.ngay_bao_ve)) {
            setMessage("Ngày bảo vệ không đúng định dạng (YYYY-MM-DD).");
            return;
        }

        try {
            let access_token = await AsyncStorage.getItem('token')
            const res = await authApi(access_token).post(endpoints["add_council"], hdbvkl); // not authorized yet
            if (res.status === 201) {
                addNewHDBVKL(res.data);
                setMessage("Thêm thành công!");
                setTimeout(() => {
                    navigation.goBack();
                }, 100)
                
            } else {
                setMessage("An error occurred. Please try again.");
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status !== 500) {
                    setMessage(error.response.data.error);
                } else {
                    setMessage("An error occurred. Please try again.");
                }
            } else {
                setMessage("An error occurred. Please try again.");
            }
            console.error(error);
        }
    };
    
    const ngayBaoVeInputRef = useRef(null);
    useEffect(() => {
        // Focus the "Ngày bảo vệ" input field when the component mounts
        ngayBaoVeInputRef.current?.focus();
    }, []);


    return (
        <KeyboardAwareScrollView extraHeight={120}
        style={styles.container}>
            <SafeAreaView >
                <TextInput
                    label="Ngày bảo vệ (YYYY-MM-DD)"
                    ref={ngayBaoVeInputRef}
                    value={hdbvkl.ngay_bao_ve}
                    onChangeText={(text) => handleInputChange("ngay_bao_ve", text)}
                    style={styles.input}
                />
                {/* <Text style={styles.title}>Thêm hội đồng bảo vệ khóa luận</Text> */}
                {/* <TextInput
                    label="Giảng viên phản biện"
                    value={hdbvkl.gv_phan_bien}
                    onChangeText={(text) => handleInputChange("gv_phan_bien", text)}
                    keyboardType="numeric"
                    style={styles.input}
                /> */}
                <DropDownSearchBar setLecturerId={(text) => handleInputChange("gv_phan_bien", text)} itemName={"Giảng viên phản biện"} iconName={"Safety"} />
                {/* <TextInput
                    label="Chủ tịch"
                    value={hdbvkl.chu_tich}
                    onChangeText={(text) => handleInputChange("chu_tich", text)}
                    keyboardType="numeric"
                    style={styles.input}
                /> */}
                <DropDownSearchBar setLecturerId={(text) => handleInputChange("chu_tich", text)} itemName={"Chủ tịch"} iconName={"user"} />
                {/* <TextInput
                    label="Thư ký"
                    value={hdbvkl.thu_ky}
                    onChangeText={(text) => handleInputChange("thu_ky", text)}
                    keyboardType="numeric"
                    style={styles.input}
                /> */}
                <DropDownSearchBar setLecturerId={(text) => handleInputChange("thu_ky", text)} itemName={"Thư ký"} iconName={"book"} />
                {hdbvkl.thanh_vien.map((tv, index) => (
                    <View key={index} style={styles.memberInputContainer}>
                        {/* <TextInput
                            label={`Thành viên ${index + 1}`}
                            value={tv}
                            onChangeText={(text) => handleMemberChange(index, text)}
                            keyboardType="numeric"
                            style={[styles.input, styles.memberInput]}
                        /> */}
                        <DropDownSearchBar setLecturerId={(text) => handleMemberChange(index, text)} 
                            itemName={`Thành viên ${index + 1}`} 
                            iconName={"adduser"}
                            styles={{flex: 1}} />
                        <TouchableOpacity onPress={() => handleRemoveMember(index)} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <Button mode="outlined" onPress={handleAddMember} style={styles.button}>
                    Thêm thành viên
                </Button>
                <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    Lưu
                </Button>
                {message ? <Text>{message}</Text> : null}
            </SafeAreaView>
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
    memberInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    memberInput: {
        flex: 1,
    },
    removeButton: {
        marginLeft: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        padding: 5,
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    button: {
        marginTop: 10,
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
});

export default AddHDBVKL;
