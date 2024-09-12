import moment from "moment";
import React, { useEffect, useMemo } from "react";
import { View, Text, ActivityIndicator, Image, ScrollView, Dimensions, LogBox } from "react-native"
import { Button, Card, Chip, List, Menu, Paragraph, Title } from "react-native-paper";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles"
import "moment/locale/vi"
import { BarChart, LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyDataTable from "../../Utils/MyDataTable";

LogBox.ignoreLogs(["Each child in a list should have a unique"])

const ScoreStats = () => {
    const [data, setData] = React.useState({ scores: [], years: [] })
    const [selectedYear, setSelectedYear] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const chartConfig = {
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: 'white',
        // backgroundGradientToOpacity: 0.5,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.8,
        useShadowColorFromDataset: false,
        decimalPlaces: 0, // no decimal in yAxis
    };

    const screenWidth = Dimensions.get("window").width;

    const loadData = async () => {
        try {
            let access_token = await AsyncStorage.getItem('token')
            let res = await authApi(access_token).get(endpoints['avg_scores'])
            // setScores(res.data["average_scores"])
            // setYears(res.data["years"])
            setData({
                scores: res.data["average_scores"],
                years: res.data["years"]
            });
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // const filteredData = selectedYear ? scores.filter(item => new Date(item.created_date).getFullYear() === selectedYear) : scores
    const filteredData = useMemo(() => {
        return selectedYear ? data.scores.filter(item => new Date(item.created_date).getFullYear() === selectedYear) : data.scores;
    }, [data.scores, selectedYear])

    const barData = {
        labels: filteredData.map(item => item.ten_khoa_luan),
        datasets: [
            {
                data: filteredData.map(item => item.diem_tong)
            }
        ]
    };

    return (
        <ScrollView contentContainerStyle={MyStyles.container}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={<Button onPress={openMenu} mode="elevated" >{selectedYear===null?"All years":selectedYear}</Button>}>
                <Menu.Item
                    onPress={() => {
                        setSelectedYear(null);
                        closeMenu();
                    }}
                    title="All Years"
                />
                {data.years.map((year) => (
                    <Menu.Item
                        onPress={() => {
                            setSelectedYear(year);
                            closeMenu();
                        }}
                        title={year.toString()}
                        key={year}
                    />
                ))}
            </Menu>
            <ScrollView horizontal style={{}} >
                <BarChart 
                    data={barData}
                    width={screenWidth * 4}
                    height={Dimensions.get('window').height * 2 / 3}
                    yAxisLabel=""
                    yAxisSuffix=" điểm"
                    yAxisInterval={1}
                    chartConfig={chartConfig}
                    verticalLabelRotation={30}
                    fromZero={true} // start Y-axis from zero
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    showValuesOnTopOfBars={true}
                    showBarTops={true}
                    yLabelsOffset={14}
                    style={{
                        borderRadius: 16,
                        margin: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 4, // for Android
                    }}
                />
            </ScrollView>
            {loading && <ActivityIndicator/>}
            <View style={{marginHorizontal: 10, marginBottom: 65}}>
                <MyDataTable data={data.scores} titles={["Tên khóa luận", "Điểm tổng", "Ngày tạo"]} />
                {/* {data.scores.map(item => (
                    <Card key={item.id} style={MyStyles.margin}>
                        <Card.Content>
                            <Title>
                                {item.ten_khoa_luan}
                            </Title>
                            <Paragraph>
                                Created on: {moment(item.created_date).fromNow()}
                            </Paragraph>
                            <Paragraph>
                                Average scores: {item.diem_tong}
                            </Paragraph>
                        </Card.Content>
                    </Card>
                ))} */}
            </View>
        </ScrollView>
        // <View style={MyStyles.container}>
        //     <View style={MyStyles.row}>
        //         <ScrollView>
        //             {scores.map(c=><List.Item style={MyStyles.margin} key={c.id} title={c.ten_khoa_luan} description={moment(c.created_date).fromNow()}/>)}
        //             {loading && <ActivityIndicator/>}
        //         </ScrollView>
        //     </View>
        // </View>
    )
}

export default ScoreStats