import React, { Component } from 'react'
import { StyleSheet, ScrollView, View, Dimensions } from 'react-native'
import PieChart from 'react-native-pie-chart'

export default class MyPieChart extends Component {
  state = {
    selectedSlice: null,
  }

  handleSlicePress = (index) => {
    this.setState((prevState) => ({
      selectedSlice: prevState.selectedSlice === index ? null : index,
    }));
  }

  render() {
    const { chartData } = this.props;
    const { selectedSlice } = this.state;

    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <PieChart
            widthAndHeight={Dimensions.get('window').width * 0.8}
            series={chartData.map(item => item.frequency)}
            sliceColor={chartData.map((item, index) => index === selectedSlice ? adjustColor(item.color, 0.8) : item.color)}
            coverRadius={0.45}
            coverFill={'white'}
            hasLegend={false}
            onPress={this.handleSlicePress}
          />
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    margin: 10,
  },
});

function adjustColor(color, amount) {
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}