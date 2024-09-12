import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";

const DetailHDBVKL = ({ route }) => {
    let { hdbvkl } = route.params;

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Chi tiết hội đồng bảo vệ khóa luận</Title>
            <View style={styles.cardContainer}>
                <Card elevation={5} style={styles.card}>
                    <Card.Content>
                        <Paragraph style={styles.label}>ID:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.id}</Text>

                        <Paragraph style={styles.label}>Ngày tạo:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.created_date}</Text>

                        <Paragraph style={styles.label}>Trạng thái:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.trang_thai ? "Hoạt động" : "Không hoạt động"}</Text>

                        <Paragraph style={styles.label}>Ngày bảo vệ:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.ngay_bao_ve}</Text>

                        <Paragraph style={styles.label}>Giáo viên phản biện:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.gv_phan_bien}</Text>

                        <Paragraph style={styles.label}>Chủ tịch:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.chu_tich}</Text>

                        <Paragraph style={styles.label}>Thư ký:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.thu_ky}</Text>

                        <Paragraph style={styles.label}>Thành viên:</Paragraph>
                        <Text style={styles.text}>{hdbvkl.thanh_vien.join(", ")}</Text>
                    </Card.Content>
                </Card>
            </View>
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
    cardContainer: {
        alignItems: "center",
    },
    card: {
        width: "90%",
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    text: {
        fontSize: 16,
    },
});

export default DetailHDBVKL;
