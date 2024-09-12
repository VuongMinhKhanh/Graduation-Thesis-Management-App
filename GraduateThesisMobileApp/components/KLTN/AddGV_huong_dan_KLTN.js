import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { ActivityIndicator, List, Button, Checkbox, Searchbar } from 'react-native-paper';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddGV_huong_dan_KLTN = ({ route, navigation }) => {
  const { id } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [giangVien, setGiangVien] = useState([]);
  const [selectedGVHD, setSelectedGVHD] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGiangVien = async () => {
      try {
        setLoading(true);
        let access_token = await AsyncStorage.getItem('token')
        const response = await authApi(access_token).get(`${endpoints['GiangVien']}?kw=${searchQuery}`);
        setGiangVien(response.data.results);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadGiangVien();
  }, [searchQuery]);

  const handleSelectGVHD = (gvId) => {
    if (selectedGVHD.includes(gvId)) {
      setSelectedGVHD(selectedGVHD.filter(id => id !== gvId));
    } else {
      if (selectedGVHD.length >= 2) {
        Alert.alert('Error', 'Bạn chỉ có thể chọn tối đa 2 giảng viên hướng dẫn.');
      } else {
        setSelectedGVHD([...selectedGVHD, gvId]);
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedGVHD.length === 0) {
      Alert.alert('Không có giảng viên được chọn!', 'Hãy chọn ít nhất một giảng viên.');
      return;
    }
  
    const gvHuongDanData = selectedGVHD.map(id => ({ id: id.toString() }));
  
    try {
      setLoading(true);
      const response = await fetch(`http://hoangila2016.pythonanywhere.com/KLTN/${id}/add_gvhd/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gv_huong_dan: gvHuongDanData }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === "Số lượng giảng viên hướng dẫn đã đạt tối đa") {
          Alert.alert('Số lượng giảng viên tối đa!', 'Số lượng giảng viên hướng dẫn đã đạt tối đa.');
        } else {
          Alert.alert('Thất bại', 'Thêm thất bại. Làm ơn thử lại sau.');
        }
        setLoading(false);
        return;
      }
  
      const data = await response.json();
      setLoading(false);
      Alert.alert('Thành công', 'Thêm thành công giảng viên hướng dẫn');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert('Thất bại', 'Thêm thất bại. Làm ơn thử lại sau.');
    }
  };
  

  const renderGiangVienItem = ({ item }) => (
    <List.Item
      title={`${item.first_name} ${item.last_name}`}
      description={`Email: ${item.email}\nBằng cấp: ${item.bang_cap}\nKinh nghiệm: ${item.kinh_nghiem}`}
      right={() => (
        <Checkbox
          status={selectedGVHD.includes(item.pk) ? 'checked' : 'unchecked'}
          onPress={() => handleSelectGVHD(item.pk)}
        />
      )}
      onPress={() => handleSelectGVHD(item.pk)}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Nhập tên giảng viên"
      />

      {loading ? (
        <ActivityIndicator animating={true} />
      ) : (
        <FlatList
          data={giangVien}
          renderItem={renderGiangVienItem}
          keyExtractor={(item) => item.pk.toString()}
        />
      )}

      <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
        Xác nhận
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  submitButton: {
    marginTop: 10,
  },
});

export default AddGV_huong_dan_KLTN;
