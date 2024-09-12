import React, { useEffect, useState } from 'react';
import {  Dropdown } from "react-native-element-dropdown";
import AntDesign from '@expo/vector-icons/AntDesign';
import MyStyles from "./MyStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../configs/APIs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const DropDownSearchBar = ({ setCouncils, itemName = null, styles = {}, setLecturerId, iconName = null, setStudentId }) => {
    const [value, setValue] = useState("");
    const [selectedName, setSelectedName] = useState("")
    const [data, setData] = useState([])

    const loadData = async () => {
        try {
            if (selectedName.length > 2) {
              let access_token = await AsyncStorage.getItem('token')
              let res
              if (setStudentId)
                res = await authApi(access_token).get(endpoints['getStudents'](selectedName));
              else
                res = await authApi(access_token).get(endpoints['getLecturers'](selectedName));
              let dataTemp = []
              
              for (const [, value] of Object.entries(res.data.results)) {
                  dataTemp.push({
                      "label": value['first_name'] + " " + value['last_name'], 
                      "value": value["pk"]
                  })
              }
              setData(dataTemp)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        loadData()
    }, [selectedName])

    const filterCouncils = async (lecturerId) => {
      try {
        let access_token = await AsyncStorage.getItem('token')
        let res = await authApi(access_token).get(endpoints['HDBVKL'](lecturerId));

        setCouncils(res.data.results)
      } catch (error) {
        console.error(error)
      }
    }

    return (
      <KeyboardAwareScrollView>
        <Dropdown
          style={[MyStyles.dropdown, styles]}
          placeholderStyle={MyStyles.placeholderStyle}
          selectedTextStyle={MyStyles.selectedTextStyle}
          inputSearchStyle={MyStyles.inputSearchStyle}
          iconStyle={MyStyles.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={itemName?itemName:"Select item"}
          searchPlaceholder="Search..."
          value={value}
          onChange={item => {
            setValue(item.value);
            setSelectedName(item.label)
            if (setLecturerId)
              setLecturerId(item.value)
            if (setCouncils)
              filterCouncils(item.value)
            if (setStudentId)
              setStudentId(item.value)
          }}
          renderLeftIcon={() => (
            <AntDesign style={MyStyles.icon} color="black" name={iconName?iconName:""} size={20} />
          )}
          onChangeText={text => {
            // console.log(text)
            setSelectedName(text)
            if (text.length > 2) {
              loadData()
            }
          }}
        />
      </KeyboardAwareScrollView>
    );
};

export default DropDownSearchBar;
