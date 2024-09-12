import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { ActivityIndicator, RadioButton, Button, TextInput, Chip } from 'react-native-paper';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon từ thư viện vector-icons
import { isCloseToBottom } from '../../Utils/Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddHD_KLTN = ({ route, navigation }) => {
  const { id } = route.params; 
  const [hdbvklList, setHdbvklList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHDBVKL, setSelectedHDBVKL] = useState(null);
  const [kltn, setKltn] = useState(0);
  const [trangThai, setTrangThai] = useState("True");
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  
  useEffect(() => {
    const loadHDBVKL = async () => {
      setLoading(true);
      try {
        let access_token = await AsyncStorage.getItem('token')
        let res = await authApi(access_token).get(`${endpoints['HDBVKL']("")}&kltn=${kltn}&trang_thai=${trangThai}&page=${page}`);
        
        if (page === 1) {
          setHdbvklList(res.data.results);
        } else {
          setHdbvklList(current => [...current, ...res.data.results]);
        }
        setNextPage(res.data.next);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadHDBVKL();
  }, [kltn, trangThai, page]);

  const search = (value, callback) => {
    setPage(1);
    setHdbvklList([]); // Reset the list
    callback(value);
  };

  const handleSubmit = () => {
    if (!selectedHDBVKL) {
      Alert.alert('Vui lòng chọn một hội đồng bảo vệ khóa luận');
      return;
    }

    fetch(`http://hoangila2016.pythonanywhere.com/KLTN/${id}/add_hdbvkl/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hdbvkl: selectedHDBVKL }),
    })
      .then((response) => {
        if (response.ok) {
          Alert.alert('Hội đồng bảo vệ khóa luận đã được thêm thành công');
          setTimeout(() => {
            navigation.goBack(); // Navigate back to the previous screen
          }, 100)
        } else {
          console.error(error);
          Alert.alert('Thêm hội đồng bảo vệ khóa luận thất bại');
        }
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Thêm hội đồng bảo vệ khóa luận thất bại');
      });
  };

  const loadMore = ({ nativeEvent }) => {
    if (loading === false && isCloseToBottom(nativeEvent) && nextPage) {
      setPage(prevPage => prevPage + 1);
      console.info(page)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerChip}>
        <Chip
          icon={({ color }) => (
            <Icon name="lock" color={color} size={20} />
          )}
          onPress={() => search("False", setTrangThai)}
          style={[styles.chip, trangThai === "False" && styles.selectedChip]}
        >
          Hội đồng đã khóa
        </Chip>
        <Chip
          icon={({ color }) => (
            <Icon name="lock-open" color={color} size={20} />
          )}
          onPress={() => search("True", setTrangThai)}
          style={[styles.chip, trangThai === "True" && styles.selectedChip]}
        >
          Hội đồng đang mở
        </Chip>
      </View>
      <TextInput
        style={styles.textInput}
        label="Số lượng khóa luận đã tham gia"
        value={kltn.toString()}
        onChangeText={text => search(text, setKltn)}
        placeholder='Nhập số lượng khóa luận tốt nghiệp'
        keyboardType="numeric"
      />
      {loading && page === 1 ? (
        <ActivityIndicator animating={true} size="large" color="#0000ff" />
      ) : (
        <>
          <ScrollView onScroll={loadMore} contentContainerStyle={styles.scrollViewContainer}>
            <RadioButton.Group onValueChange={newValue => setSelectedHDBVKL(newValue)} value={selectedHDBVKL}>
              {hdbvklList.map((item) => (
                <RadioButton.Item
                  key={item.id}
                  label={`ID: ${item.id} - Ngày bảo vệ: ${item.ngay_bao_ve}`}
                  value={item.id}
                  style={styles.radioButtonItem}
                />
              ))}
            </RadioButton.Group>
            {loading && page > 1 && <ActivityIndicator />}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleSubmit}>
              Xác nhận
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  radioButtonItem: {
    marginVertical: 10,
  },
  buttonContainer: {
    padding: 10,
    bottom: 0,
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  textInput: {
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  containerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  chip: {
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
  },
  selectedChip: {
    backgroundColor: '#007bff',
  },
});

export default AddHD_KLTN;
