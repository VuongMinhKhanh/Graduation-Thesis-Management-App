import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Card, Paragraph, Text, Title, Button } from "react-native-paper";
import { authApi, endpoints, getThesisDetails } from "../../configs/APIs";
import PopoverMenu from "./PopoverMenu";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const DetailTheses = ({ route, navigation }) => {
    const { thesis } = route.params;
    const [details, setDetails] = useState(null);

    const fetchDetails = async () => {
        let access_token = await AsyncStorage.getItem('token')
        // let res = await authApi(access_token).get(endpoints['theses'])
        // const response = await getThesisDetails(thesis.id); // not authorized yet
        const response = await authApi(access_token).get(endpoints['thesis_details'](thesis.id))
        setDetails(response.data);
    };

    useEffect(() => {
        fetchDetails();
    }, [thesis.id]);

    // Re-fetch details when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchDetails();
        }, [])
    );

    if (!details) {
        return <ActivityIndicator />;
    }

    const handleAddHDBVKL = () => {
        // Implement the logic to add a new HDBVKL
        navigation.navigate('AddHD_KLTN',{ id: thesisId })
    };

    const handleAddSupervisor = () => {
        // Implement the logic to add a new supervisor
        navigation.navigate('AddSupervisor', { thesisId: thesis.id });
    };

    const handleAddCriteria = () => {
        // Implement the logic to add a new criteria
        navigation.navigate('AddCriteria', { thesisId: thesis.id });
    };

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.title}>Thesis Details</Title>
            <Card style={styles.section}>
                <Card.Content>
                    <Title style={styles.title1}>Thông tin chung</Title>
                    <Paragraph>ID: {details.id}</Paragraph>
                    <Paragraph>Tên khóa luận: {details.ten_khoa_luan}</Paragraph>
                    <Paragraph>Tỷ lệ đạo văn: {details.ty_le_dao_van}%</Paragraph>
                    <Paragraph>Ngày tạo: {new Date(details.created_date).toLocaleDateString()}</Paragraph>
                    <Paragraph>Điểm tổng: {details.diem_tong}</Paragraph>
                    <Paragraph>Trạng thái: {details.trang_thai ? "Active" : "Inactive"}</Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.section}>
                <Card.Content>
                    <Title style={styles.title1}>Sinh viên</Title>
                    {details.mssv.length === 0 ? (
                        <Paragraph>Chưa có sinh viên!</Paragraph>
                    ) : (
                        details.mssv.map((student, index) => (
                            <Paragraph key={index}>
                                {student.first_name} {student.last_name} ({student.username}) - {student.email}
                            </Paragraph>
                        ))
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.section}>
                <Card.Content>
                    <Title style={styles.title1}>Hội đồng bảo vệ khóa luận</Title>
                    {details.hdbvkl ? (
                        <>
                            <Paragraph>Ngày bảo vệ: {details.hdbvkl.ngay_bao_ve}</Paragraph>
                            <Paragraph>Giảng viên phản biện: {details.hdbvkl.gv_phan_bien}</Paragraph>
                            <Paragraph>Chủ tịch: {details.hdbvkl.chu_tich}</Paragraph>
                            <Paragraph>Thư ký: {details.hdbvkl.thu_ky}</Paragraph>
                            <Paragraph>Thành viên: {details.hdbvkl.thanh_vien.join(", ")}</Paragraph>
                        </>
                    ) : (
                        <Paragraph>Không có thông tin Hội đồng bảo vệ khóa luận.</Paragraph>
                    )}
                    {!details.hdbvkl && (
                        <Button mode="contained" onPress={()=>navigation.navigate('AddHD_KLTN',{ id: thesis.id })} style={styles.button}>
                            Thêm hội đồng
                        </Button>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.section}>
                <Card.Content>
                    <Title style={styles.title1}>Giảng viên hướng dẫn</Title>
                    {details.gv_huong_dan.length === 0 ? (
                        <Paragraph>Chưa có giảng viên hướng dẫn!</Paragraph>
                    ) : (
                        details.gv_huong_dan[0].gv_huong_dan.map((supervisor, index) => (
                            <Paragraph key={index}>
                                {supervisor.first_name} {supervisor.last_name} - {supervisor.email} - Bằng cấp: {supervisor.bang_cap} - Kinh nghiệm: {supervisor.kinh_nghiem}
                            </Paragraph>
                        ))
                    )}
                    <Button mode="contained" onPress={()=>navigation.navigate('AddGV_huong_dan_KLTN',{ id: thesis.id })} style={styles.button}>
                        Thêm giảng viên hướng dẫn
                    </Button>
                </Card.Content>
            </Card>

            <Card style={styles.section}>
                <Card.Content>
                    <Title style={styles.title1}>Tiêu chí</Title>
                    {details.tieu_chi.map((criteria, index) => (
                        <Paragraph key={index}>
                            {criteria.tieu_chi} - {criteria.ty_le}
                        </Paragraph>
                    ))}
                    <Button mode="contained" onPress={()=>navigation.navigate('AddTieuChi_KLTN',{ id: thesis.id })} style={styles.button}>
                        Thêm tiêu chí
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
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
        textAlign: 'center',
    },
    title1: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 4, // Adds shadow effect for Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    button: {
        marginTop: 10,
    },
});

export default DetailTheses;
