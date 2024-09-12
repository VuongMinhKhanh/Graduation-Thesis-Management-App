import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const PopoverMenu = ({ thesisId }) => {
  // State to control the visibility of the popover
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Menu button */}
      <TouchableOpacity onPress={() => setPopoverVisible(!isPopoverVisible)}>
        <Text style={styles.menuButton}>☰</Text>
      </TouchableOpacity>

      {/* Popover */}
      {isPopoverVisible && (
        <View style={styles.popover}>
          <TouchableOpacity onPress={() => { 
            setPopoverVisible(false);
            navigation.navigate('AddHD_KLTN',{ id: thesisId });
            }}>
            <Text style={styles.popoverItem}>Thêm hội đồng</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setPopoverVisible(false);
            navigation.navigate('AddTieuChi_KLTN',{ id: thesisId });
          }}>
            <Text style={styles.popoverItem}>Thêm tiêu chí</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setPopoverVisible(false);
            navigation.navigate('AddGV_huong_dan_KLTN',{ id: thesisId });
          }}>
            <Text style={styles.popoverItem}>Thêm giảng viên hướng dẫn</Text>
          </TouchableOpacity>
          {/* Add more menu items if needed */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  menuButton: {
    fontSize: 24,
    color: '#333',
    padding: 10,
  },
  popover: {
    position: 'absolute',
    top: 40, // Position of the popover
    right: 0, // Position of the popover
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  popoverItem: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 20, // Add horizontal padding for more space
    minWidth: 150, // Minimum width to ensure enough space for content
    height: 60,
  },
});

export default PopoverMenu;
