import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { TextInput, Button, List, Checkbox, Searchbar } from 'react-native-paper';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isCloseToBottom } from '../../Utils/Utils'; // Assuming this utility function is already defined

const AddTieuChi_KLTN = ({ route, navigation }) => {
  const { id } = route.params; // Get the KLTN id passed from the previous screen
  const [tieuChiList, setTieuChiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [selectedTieuChi, setSelectedTieuChi] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTieuChi, setNewTieuChi] = useState({ tieu_chi: '', ty_le: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      let access_token = await AsyncStorage.getItem('token');
      let res = await authApi(access_token).get(`${endpoints['TieuChi']}?page=1&kw=${searchQuery}`);
      setTieuChiList(res.data.results);
      setNextPage(res.data.next);
      setPage(2); // Set to the next page to load on scroll
    } catch (error) {
      console.error(error);
    } finally {
      if (isRefreshing) setRefreshing(false);
      else setLoading(false);
    }
  };

  const loadMoreTieuChi = async () => {
    if (nextPage) {
      setLoading(true);
      try {
        let access_token = await AsyncStorage.getItem('token');
        let res = await authApi(access_token).get(nextPage);
        setTieuChiList(current => [...current, ...res.data.results]);
        setNextPage(res.data.next);
        setPage(page + 1);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery,page]);

  const handleScroll = ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent) && !loading) {
      loadMoreTieuChi();
    }
  };

  const handleAddTieuChiToKLTN = async () => {
    if (selectedTieuChi.length === 0) {
      Alert.alert("Criteria Missing", "Can't add criteria without choosing at least one criteria");
      return;
    }

    try {
      let access_token = await AsyncStorage.getItem('token');
      let res = await authApi(access_token).post(
        `http://hoangila2016.pythonanywhere.com/KLTN/${id}/add_tieu_chi_vao_kltn/`,
        { tieu_chi: selectedTieuChi }
      );

      if (res.status === 201) {
        Alert.alert('Success', 'Tiêu chí đã được thêm vào khóa luận tốt nghiệp.');
        navigation.goBack(); // Navigate back to the previous screen (DetailTheses)
      } else {
        let data = await res.json();
        Alert.alert('Error', data.error || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        if (errorMessage === "Tổng tỷ lệ của các tiêu chí phải bằng 100") {
          Alert.alert('Tỷ lệ tiêu chí tối đa', "Tổng tỷ lệ của các tiêu chí phải bằng 100");
        } else {
          Alert.alert('Error', errorMessage || 'Có lỗi xảy ra.');
        }
      } else {
        console.error(error);
        Alert.alert('Error', 'Có lỗi xảy ra.');
      }
    }
  };

  const handleCreateTieuChi = () => {
    setShowCreateForm(true);
  };

  const handleSubmitNewTieuChi = async () => {
    // Validate input
    if (!newTieuChi.tieu_chi || !newTieuChi.ty_le || (newTieuChi.ty_le <= 0 || newTieuChi.ty_le > 100)) {
      Alert.alert('Error', 'Vui lòng điền đầy đủ thông tin và tỷ lệ phải lớn hơn 0 và bé hơn bằng 100.');
      return;
    }

    try {
      let access_token = await AsyncStorage.getItem('token');
      let res = await APIs.post(`${endpoints['TieuChi']}`, newTieuChi, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (res.status === 201) {
        Alert.alert('Success', 'Tiêu chí mới đã được tạo thành công.');
        setShowCreateForm(false);
        // Refresh tieu chi list
        loadData();
      } else {
        let data = await res.json();
        Alert.alert('Error', data.error || 'Có lỗi xảy ra khi tạo tiêu chí mới.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Có lỗi xảy ra khi tạo tiêu chí mới.');
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedTieuChi.includes(id)) {
      setSelectedTieuChi(selectedTieuChi.filter((item) => item !== id));
    } else {
      setSelectedTieuChi([...selectedTieuChi, id]);
    }
  };

  if (loading && !refreshing && page === 1) {
    return <ActivityIndicator animating={true} size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        style={styles.searchBar}
        placeholder="Nhập tên tiêu chí"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      {showCreateForm ? (
        <View style={styles.createForm}>
          <TextInput
            label="Tên tiêu chí"
            value={newTieuChi.tieu_chi}
            onChangeText={(text) => setNewTieuChi({ ...newTieuChi, tieu_chi: text })}
            style={styles.input}
          />
          <TextInput
            label="Tỷ lệ"
            value={newTieuChi.ty_le}
            onChangeText={(text) => setNewTieuChi({ ...newTieuChi, ty_le: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleSubmitNewTieuChi} style={styles.addButton}>
            Thêm
          </Button>
        </View>
      ) : (
        <>
          <Button icon="plus" mode="contained" onPress={handleCreateTieuChi} style={styles.createButton}>
            Tạo Tiêu Chí Mới
          </Button>
          <ScrollView
            onScroll={handleScroll}
            refreshControl={<RefreshControl onRefresh={() => loadData(true)} refreshing={refreshing} />}
          >
            {tieuChiList.map((item) => (
              <View key={item.id} style={styles.checkboxItem}>
                <Checkbox
                  status={selectedTieuChi.includes(item.id) ? 'checked' : 'unchecked'}
                  onPress={() => handleCheckboxChange(item.id)}
                />
                <List.Item title={`${item.tieu_chi} - ${item.ty_le}`} />
              </View>
            ))}
          </ScrollView>
          <Button mode="contained" onPress={handleAddTieuChiToKLTN} style={styles.addButton}>
            Thêm Tiêu Chí vào Khóa Luận
          </Button>
        </>
      )}
      {loading && nextPage && <ActivityIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    marginTop: 20,
    borderRadius: 5,
    padding: 8,
  },
  createButton: {
    alignSelf: 'auto',
    marginVertical: 5,
    padding: 5,
  },
  createForm: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  searchBar: {
    marginBottom: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AddTieuChi_KLTN;
