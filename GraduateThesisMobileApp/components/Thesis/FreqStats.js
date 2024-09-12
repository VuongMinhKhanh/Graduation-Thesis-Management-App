import moment from "moment";
import React, { useEffect, useMemo } from "react";
import { View, Text, ActivityIndicator, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard, RefreshControl } from "react-native"
import { Button, Card, Chip, List, Menu, Modal, PaperProvider, Paragraph, Portal, Searchbar, TextInput, Title, TouchableRipple } from "react-native-paper";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles"
import "moment/locale/vi"
import { PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyPieChart from "./PieChart";

const FreqStats = () => {
    const [data, setData] = React.useState({
        freqs: [],
        faculties: [],
    })
    const [faculty, setFaculty] = React.useState("All faculties")
    const [loading, setLoading] = React.useState(false)
    const [reloading] = React.useState(false)

    const loadData = async () => {
        try {
            let access_token = await AsyncStorage.getItem('token')
            let res = await authApi(access_token).get(endpoints['freq'])

            setData({
                freqs: res.data["freq_stats"],
                faculties: [{
                    id: null,
                    ten_nganh: "All faculties"
                },  ...res.data["faculties"]]
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

    const chartData = useMemo(() => {
        const filteredData = data.freqs.filter(item => faculty === "All faculties" || item.ten_nganh === faculty);
        const totalFrequency = filteredData.reduce((sum, item) => sum + item.freq, 0);
      
        if (totalFrequency === 0) {
          return [
            {
              name: "No data",
              frequency: 1,
              color: '#cccccc',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15
            }
          ];
        }
      
        return filteredData.map(item => ({
          name: item.ten_nganh,
          frequency: item.freq,
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15
        }));
    }, [data.freqs, faculty]);

    // const filterFaculties = useMemo(() => {
    //     return data.faculties.filter(faculty =>
    //       faculty.ten_nganh.toLowerCase().includes(searchQuery.toLowerCase())
    //     );
    //   }, [searchQuery, data.faculties]); 

    // const chartConfig = {
    //     backgroundColor: '#1cc910',
    //     backgroundGradientFrom: '#eff3ff',
    //     backgroundGradientTo: '#efefef',
    //     decimalPlaces: 2,
    //     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    //     style: {
    //         borderRadius: 16
    //     }
    // }

    return (
        <ScrollView contentContainerStyle={[MyStyles.container, {flex: 1}]}
        refreshControl={
            <RefreshControl refreshing={reloading} 
            onRefresh={loadData}
            elevation={10}
            />
        }>
            <View>
                <SearchBarWithSuggestions
                    data={data.faculties}
                    onSelect={(faculty) => {
                        setFaculty(faculty);
                    }}
                />
            </View>
            <View backgroundColor={"#ffedee"} style={{margin: 10, padding: 20, borderRadius: 12, marginBottom: 60, 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,}}>
                <MyPieChart chartData={chartData} />
                {/* <View horizontal showsHorizontalScrollIndicator={true}
                >
                    <PieChart
                        data={chartData}
                        width={Dimensions.get('window').width}
                        height={Dimensions.get('window').width} // make it height = width
                        chartConfig={chartConfig}
                        accessor="frequency"
                        backgroundColor="transparent"
                        paddingLeft={(Dimensions.get('window').width / 4)}
                        absolute
                        hasLegend={false}
                    />
                </View> */}
                {loading && <ActivityIndicator/>}
                <View style={MyStyles.legend}>
                    {chartData.map((item, index) => (
                        <Text key={index} style={{ color: item.color, fontSize: 20 }}>
                            ● {item.name} có {item.frequency} khóa luận
                        </Text>
                    ))}
                </View>
            </View>
        </ScrollView>
    )
}

const SearchBarWithSuggestions = ({ data, onSelect }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [visible, setVisible] = React.useState(false);

    const onChangeSearch = (query) => {
        setSearchQuery(query);
        setVisible(query.length === 0 || query.length > 2);
    };

    const onFocus = () => {
        setVisible(searchQuery.length === 0 || searchQuery.length > 2);
    };

    const filteredData = useMemo(() => {
        if (searchQuery.length > 2) {
            if (searchQuery === "All faculties") {
                return data
            }
            return data.filter(item =>
                item.ten_nganh.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return searchQuery.length === 0 ? data : []; // return all faculty names when empty
    }, [searchQuery, data]);

    return (
        <View>
            {/* <AutocompleteInput
                data={filteredData}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
                placeholder="Search faculty"
                containerStyle={MyStyles.input}
                listContainerStyle={MyStyles.suggestion}
                listStyle={MyStyles.suggestionList}
                itemStyle={MyStyles.suggestionItem}
                itemTextStyle={MyStyles.suggestionText}
                flatListProps={{
                    keyExtractor: (_, idx) => idx,
                    renderItem: ({ item }) => <Text>{item.ten_nganh}</Text>,
                  }}
                // renderItem={({ item }) => (
                // <TouchableOpacity
                //     onPress={() => {
                //     onSelect(item.ten_nganh);
                //     setSearchQuery(item.ten_nganh);
                //     }}
                // >
                //     <AutocompleteInput key={item.id} text={item.ten_nganh} />
                // </TouchableOpacity>
                // )}
            /> */}
            <TextInput
                style={[MyStyles.input, {width: 320}]} // can't use Dimensions.Width
                label="Search faculty"
                onChangeText={onChangeSearch}
                value={searchQuery}
                onFocus={onFocus}
                right={<TextInput.Icon icon="text-search" 
                onPress={() => {
                    setTimeout(() => {
                        setVisible(false)
                    }, 100)
                }}
                />}
                // onBlur={() => {
                //     setVisible(false)
                // }}
            />
            
            {visible && (
                <ScrollView 
                    style={MyStyles.suggestion}
                    // keyboardShouldPersistTaps="handled" // not working
                    
                >
                    {filteredData.map((faculty) => (
                        // <List.Item
                        //     title={faculty.ten_nganh}
                        //     onPress={() => {
                        //         onSelect(faculty.ten_nganh);
                        //         setSearchQuery(faculty.ten_nganh);
                        //         setVisible(false);
                        //     }}
                        //     key={faculty.id}
                        // />
                        // this is dropdown
                        <TouchableRipple // test Touchable, seems worse than normal List
                            onPress={() => {
                                onSelect(faculty.ten_nganh);
                                setSearchQuery(faculty.ten_nganh);
                                setVisible(false);
                                // console.log("hello")
                            }}
                            key={faculty.id}
                            style={MyStyles.touchableItem}
                        >
                            <Text style={MyStyles.touchableText}>{faculty.ten_nganh}</Text>
                        </TouchableRipple>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default FreqStats


