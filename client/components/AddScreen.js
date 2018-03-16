import React from 'react';
import BottomNavigation from './BottomNavigation';
import {Button, View, Text } from 'react-native';
import { NavigationActions } from 'react-navigation'


const backAction = NavigationActions.back({
  key: null
}) 

export default class AddScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Add Screen</Text>
        <BottomNavigation />
      </View>
    );
  }
}