import React, { useContext } from "react";
import { Text, View, ScrollView, RefreshControl, Alert } from "react-native"
import MyStyles from "../../styles/MyStyles";
import { ActivityIndicator, Button, Card, DataTable, Dialog, Icon, IconButton, Paragraph, Portal, Title } from "react-native-paper";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import ChangeThesisStatusButton from "../../Utils/ChangeThesisStatusButton";
import { LogBox } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/Contexts";
import AddDiem from "../KLTN_GiangVien/AddDiem";

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const ThesisDetails = ({ route, navigation }) => {
    const [thesisId, setThesisId] = React.useState(route.params!==undefined?route.params.thesisId:null);
    const thesisStatus = route.params!==undefined?route.params.thesisStatus:null;
    const setTheses = route.params!==undefined?route.params.setTheses:null;
    const [loading, setLoading] = React.useState(true)
    const [dialogMessage, setDialogMessage] = React.useState('');
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const [currentScore, setCurrentScore] = React.useState(0)
    const [thesis, setThesis] = React.useState(null);
    const [scores, setScores] = React.useState([])
    const [refreshing] = React.useState(false);
    const [shouldPoll, ] = React.useState(true);
    const [notif, setNotif] = React.useState(false);
    const [paddingTop, setPaddingTop] = React.useState({
        paddingTop: 0,
    })
    const [exportLoading, setExportLoading] = React.useState(false)
    const user = useContext(MyUserContext)
    const lec_privilege = user.current_user.class_name === "GiangVien"
    const stu_privilege = user.current_user.class_name === "SinhVien"

    React.useEffect(() => {
        if (notif) {
            setPaddingTop({
                paddingTop: 50,
            });
        } else {
            setPaddingTop({
                paddingTop: 0,
        });
        }
    }, [notif])

    const loadData = async () => {
        try {
            if (stu_privilege) {
                try {
                    let access_token = await AsyncStorage.getItem('token');
                    let studentThesis = await authApi(access_token).get(endpoints['student_thesis'](user.current_user.pk));
                    setThesisId(studentThesis.data.results[0].id);
                } catch (error) {
                console.error('Error fetching thesis ID:', error);
                };
            }

            // setTimeout(() => {
            //     fetchThesis()
            // }, 100)
            setTimeout(async () => {
                let access_token = await AsyncStorage.getItem('token');
                let tdRes = await authApi(access_token).get(endpoints['thesis_details'](thesisId))
                setThesis(tdRes.data);
    
                let scoreRes = await authApi(access_token).get(endpoints['score_details'](thesisId))
                // Group scores by "Tiêu Chí"
                const groupedScores = scoreRes.data.reduce((acc, curr) => {
                    (acc[curr.tieu_chi.tieu_chi] = acc[curr.tieu_chi.tieu_chi] || []).push(curr);
                    return acc;
                }, {});
                setScores(groupedScores);
    
                let curScore = await authApi(access_token).get(endpoints['current_score'](thesisId))
                setCurrentScore(curScore.data)
            }, 100)
           
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            setTimeout(() => {
                setLoading(false)
                setNotif(false)
            }, 100)
        }
    }

    React.useEffect(() => {
        loadData()
    }, [thesisId])

    let tableData = [];
    // console.log(scores)
    for (let [key, value] of Object.entries(scores)) {
        value.forEach((item, index) => {
            let rowData = {
                tieu_chi: key,  // Tiêu Chí
                ty_le: `${item.tieu_chi.ty_le}`,  // Tỷ Lệ %
                diem: item.diem,  // Điểm
                giang_vien: `${item.gv.first_name} ${item.gv.last_name}`  // Giảng Viên
            };
            tableData.push(rowData);
        });
    }

    const finalTableData = [];
    
    if (thesis && tableData) {
        thesis.tieu_chi.forEach((item) => {
        const matchingItems = tableData.filter((row) => row.tieu_chi === item.tieu_chi);
        if (matchingItems.length > 0) {
            matchingItems.forEach((matchingItem) => {
            finalTableData.push({
                tieu_chi: item.tieu_chi,
                ty_le: matchingItem.ty_le,
                diem: matchingItem.diem,
                giang_vien: matchingItem.giang_vien,
            });
            });
        } else {
            finalTableData.push({
            tieu_chi: item.tieu_chi,
            ty_le: item.ty_le,
            });
        }
        });
    }
    
    // console.log(finalTableData);

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                if (lec_privilege || stu_privilege) {
                    if (thesisStatus)
                        return <Button
                            mode="outlined"
                            onPress={() => thesis&&navigation.navigate("AddDiem", { thesis: thesis })}
                            disabled={loading}
                        >
                            Add Score
                        </Button>
                }
                else
                    return <ChangeThesisStatusButton 
                        thesisId={thesisId} 
                        status={thesisStatus}
                        loading={loading} 
                        navigation={navigation}
                        setTheses={setTheses} 
                    />
            }
        });
    }, [navigation, thesisStatus, loading, thesisId, setTheses, setThesis,thesis]);

    const ExportPdf = async () => {
        setExportLoading(true);  // Start loading
        try {
            let access_token = await AsyncStorage.getItem('token')
            let exportPdf = await authApi(access_token).get(endpoints['export_pdf'](thesisId))
            let response = exportPdf.data
            console.info(response)
            setDialogMessage(response)
            setDialogVisible(true);
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            setExportLoading(false)
        }
    }

    // real-time check if there is new score updated
    
    
    React.useEffect(() => {
        let interval;

        const pollForUpdates = async () => {
            try {
                let access_token = await AsyncStorage.getItem('token');
                let scoreRes = await authApi(access_token).get(endpoints['score_details'](thesisId));

                const groupedScores = scoreRes.data.reduce((acc, curr) => {
                    (acc[curr.tieu_chi.tieu_chi] = acc[curr.tieu_chi.tieu_chi] || []).push(curr);
                    return acc;
                }, {});
                const updatedScores = groupedScores;
                // Get updated thesis
                let thesisRes = await authApi(access_token).get(endpoints['thesis_details'](thesisId));

                if (
                    JSON.stringify(updatedScores) !== JSON.stringify(scores) ||
                    JSON.stringify(thesisRes.data) !== JSON.stringify(thesis)) {
                    // show refresh text
                    setNotif(true);
                }
            } catch (ex) {
                console.error(ex);
            }
        };

        if (shouldPoll) {
            interval = setInterval(pollForUpdates, 5000); // Poll every 10 seconds
        }

        return () => clearInterval(interval);
    }, [shouldPoll, thesisId, scores]);
    
    
    console.info(thesis)
    return (
        loading ? <ActivityIndicator style={{marginTop: 10}} size="small" /> : 
        <View>
            {notif && (
                <View style={MyStyles.notification}>
                    {/* <Icon source="reload" size={30} /> */}
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Refresh to update thesis!</Text>
                </View>
            )}
            <ScrollView contentContainerStyle={[MyStyles.container, paddingTop]} 
                refreshControl={
                    <RefreshControl refreshing={refreshing} 
                    onRefresh={loadData}
                    elevation={10}
                    />
                }>
                    <Portal>
                        <Dialog
                            visible={dialogVisible}
                            onDismiss={() => setDialogVisible(false)}
                        >
                            <Dialog.Title>Export Update</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>{dialogMessage}</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button 
                                onPress={() => {
                                    setDialogVisible(false)
                                }}
                                >OK</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                {thesis && (
                    <Card style={[MyStyles.section, {marginVertical: 20}]}>
                        <Card.Content>
                            <Text style={[MyStyles.header, {textAlign: "center", fontSize: 30}]}>{thesis.ten_khoa_luan}</Text>
                            <Text style={MyStyles.paragraph}><Text style={[MyStyles.label, {fontSize: 20}]}>Plagiarism Rate:</Text> {thesis.ty_le_dao_van}%</Text>
                            {thesis.diem_tong !== 0 && <Text style={MyStyles.paragraph}><Text style={[MyStyles.label, {fontSize: 20}]}>Score:</Text> {thesis.diem_tong}</Text>}
                            <Text style={MyStyles.paragraph}><Text style={[MyStyles.label, {fontSize: 20}]}>Status:</Text> {thesis.trang_thai ? 'In Progress' : 'Completed'}</Text>
                        </Card.Content>
                    </Card>
                )}
                <ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}>
                {thesis && thesis.mssv[0] && thesis.mssv.map((sv, index) => (
                    <Card key={index} style={[MyStyles.section, {width: "auto", marginHorizontal: 10}]}>
                        <Card.Content>
                            <Text style={MyStyles.header}>Student {index + 1}: {sv.first_name} {sv.last_name}</Text>
                            <Text style={MyStyles.paragraph}><Text style={MyStyles.label}>Email:</Text> {sv.email}</Text>
                            <Text style={MyStyles.paragraph}><Text style={MyStyles.label}>Year of Admission:</Text> {sv.nam_nhap_hoc}</Text>
                            <Text style={MyStyles.paragraph}><Text style={MyStyles.label}>Class:</Text> {sv.lop}</Text>
                        </Card.Content>
                    </Card>
                ))}
                    {/* {thesis && (!lec_privilege && !stu_privilege) && thesis.gv_huong_dan[0].gv_huong_dan.length < 2 && ( // 
                        <View>
                            <IconButton
                            icon="account-plus"
                            size={30}
                            iconColor="red"
                            style={{paddingRight: 10}}
                            onPress={() => navigation.navigate('AddGV_huong_dan_KLTN', { id: thesisId })}
                            />
                        </View>
                    )} */}
                </ScrollView>
                <ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}>
                {thesis && thesis.gv_huong_dan[0] && thesis.gv_huong_dan[0].gv_huong_dan.map((advisor, index) => (
                    <Card key={index} style={[MyStyles.section, {width: "auto", marginHorizontal: 10}]}>
                        <Card.Content>
                            <Text style={MyStyles.header}>Instructor {index + 1}: {advisor.first_name} {advisor.last_name}</Text>
                            <Text style={MyStyles.paragraph}><Text style={MyStyles.label}>Email:</Text> {advisor.email}</Text>
                            <Text style={MyStyles.paragraph}><Text style={MyStyles.label}>Degree:</Text> {advisor.bang_cap}</Text>
                            <Text style={MyStyles.paragraph}><Text style={MyStyles.label}>Experience:</Text> {advisor.kinh_nghiem}</Text>
                        </Card.Content>
                    </Card>
                ))}
                    {!loading && thesis && (!lec_privilege && !stu_privilege) && thesis.gv_huong_dan[0]
                    ? thesis.gv_huong_dan[0].gv_huong_dan.length < 2 && ( // 
                        <View>
                            <IconButton
                            icon="account-plus"
                            size={30}
                            iconColor="red"
                            style={{paddingRight: 10}}
                            onPress={() => navigation.navigate('AddGV_huong_dan_KLTN', { id: thesisId })}
                            />
                        </View>
                    )
                    :
                    (!lec_privilege && !stu_privilege) && <Card style={[MyStyles.section, {width: "auto", marginHorizontal: 10, }]}>
                        <Card.Content>
                            <Paragraph style={{textAlign: "center"}}>Không có thông tin Giảng viên hướng dẫn.</Paragraph>
                            <Button mode="contained" onPress={() => navigation.navigate('AddGV_huong_dan_KLTN', { id: thesisId })} style={{marginTop: 10}}>
                                Thêm Giảng viên hướng dẫn
                            </Button>
                        </Card.Content>
                    </Card>
                }
                </ScrollView>
                <Card style={[MyStyles.section, {width: "auto", marginHorizontal: 10}]}>
                    <Card.Content>
                        {!loading && thesis && thesis.hdbvkl ? (
                            <>
                                <Title style={MyStyles.header}>Hội đồng bảo vệ khóa luận {thesis.hdbvkl.id}</Title>
                                <Paragraph style={MyStyles.paragraph}>Ngày bảo vệ: {thesis.hdbvkl.ngay_bao_ve}</Paragraph>
                                <Paragraph style={MyStyles.paragraph}>Giảng viên phản biện: {thesis.hdbvkl.gv_phan_bien}</Paragraph>
                                <Paragraph style={MyStyles.paragraph}>Chủ tịch: {thesis.hdbvkl.chu_tich}</Paragraph>
                                <Paragraph style={MyStyles.paragraph}>Thư ký: {thesis.hdbvkl.thu_ky}</Paragraph>
                                <Paragraph style={MyStyles.paragraph}>Thành viên: {thesis.hdbvkl.thanh_vien.join(", ")}</Paragraph>
                            </>
                        ) : (
                            <Paragraph>Không có thông tin Hội đồng bảo vệ khóa luận.</Paragraph>
                        )}
                        {thesis && !thesis.hdbvkl && (
                            <Button mode="contained" onPress={()=>navigation.navigate('AddHD_KLTN',{ id: thesisId })} style={{marginTop: 10}}>
                                Thêm hội đồng
                            </Button>
                        )}
                    </Card.Content>
                </Card>
                <ScrollView horizontal={true} contentContainerStyle={{marginBottom: 10,}}>
                    {!loading && <DataTable style={{marginBottom: 50,}}>
                        <DataTable.Header style={MyStyles.tableHeader}>
                            <DataTable.Title style={[MyStyles.columnHeader, {width: 150}]}>Tiêu Chí</DataTable.Title>
                            <DataTable.Title numeric style={[MyStyles.columnHeader, {width: 100}]}>Tỷ lệ (%)</DataTable.Title>
                            <DataTable.Title numeric style={[MyStyles.columnHeader, {width: 100}]}>Điểm</DataTable.Title>
                            <DataTable.Title numeric style={[MyStyles.columnHeader, {width: 100}]}>Giảng viên</DataTable.Title>
                        </DataTable.Header>
                        
                        {finalTableData.length !== 0 && finalTableData.map((item, index) => (
                            <DataTable.Row key={index} style={index % 2 === 0 ? MyStyles.row : {}}>
                                <DataTable.Cell style={{ width: 150 }}>{item.tieu_chi}</DataTable.Cell>
                                <DataTable.Cell numeric style={{ width: 100 }}>{item.ty_le}</DataTable.Cell>
                                <DataTable.Cell numeric style={{ width: 100 }}>{item.diem}</DataTable.Cell>
                                <DataTable.Cell numeric style={{ width: 100 }}>{item.giang_vien}</DataTable.Cell>
                            </DataTable.Row>
                        ))}
                        <DataTable.Row style={[MyStyles.section, {marginBottom: 0}]}>
                            <DataTable.Cell numeric style={MyStyles.text}>Điểm tổng hiện tại</DataTable.Cell>
                            <DataTable.Cell numeric style={MyStyles.finalScore}>{currentScore}</DataTable.Cell>
                            <DataTable.Cell numeric></DataTable.Cell>
                            <DataTable.Cell numeric>
                            {(!lec_privilege && !stu_privilege) && <Button
                                onPress={() => {
                                    ExportPdf();
                                    setDialogVisible(false);
                                }}
                                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                mode="elevated"
                                loading={exportLoading}
                            >
                                <Text>Export PDF</Text>
                                {/* {loading && <ActivityIndicator size="small" color="#0000ff" style={{ marginLeft: 10 }} />} */}
                            </Button>}
                            </DataTable.Cell>
                        </DataTable.Row>
                        {(!lec_privilege && !stu_privilege && thesisStatus) && <Button mode="contained" onPress={()=>navigation.navigate('AddTieuChi_KLTN',{ id: thesisId })} 
                        style={[MyStyles.addCriteria]}>
                            Thêm tiêu chí
                        </Button>}
                        {/* <AddDiem alternativeThesis={thesis} /> */}
                    </DataTable>}
                </ScrollView>
            </ScrollView>
        </View>
    )
}

export default ThesisDetails