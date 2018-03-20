import React from 'react';
import axios from 'axios';
import BottomNavigation from './BottomNavigation';
import { Alert, Button, View, Text, AsyncStorage, Slider, FlatList, StyleSheet, ListItem, RefreshControl } from 'react-native';
import dummyData from '../../server/dummyData';
import store from 'react-native-simple-store';
import BackgroundTask from 'react-native-background-task';
import RNCalendarEvents from 'react-native-calendar-events';
import FontAwesome, { Icons } from 'react-native-fontawesome';
BackgroundTask.define(async () => {
  // Fetch some data over the network which we want the user to have an up-to-
  // date copy of, even if they have no network when using the app
  // const response = await fetch('http://feeds.bbci.co.uk/news/rss.xml')
  // const text = await response.text()

  // // Data persisted to AsyncStorage can later be accessed by the foreground app
  // await store.save('bbc', text).then(console.log(store.get('bbc')));
  store.save('stuff', 'works');
  // Remember to call finish()
  BackgroundTask.finish();
})

export default class AlarmssScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: null,
      first: false,
      stuff: 'no',
      userSettings: {
        defaultPrepTime: 0,
        defaultPostTime: 0,
        defaultSnoozes: 0,
      },
      alarms: [],
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderSeparator = this.renderSeparator.bind(this);
    this.toAddScreen = this.toAddScreen.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  static navigationOptions = {
    title: 'Alarms',
    headerLeft: null,
  };

  componentDidMount() {
    // RNCalendarEvents.authorizeEventStore().then(() => {
      RNCalendarEvents.saveEvent('test', {
        startDate: '2018-03-20T15:33:00.000Z',
        endDate: '2018-03-20T17:26:00.000Z',
        alarms: [{
          date: 0 // or absolute date - iOS Only
        }]
      });
    // });

    BackgroundTask.schedule();
    store.get('userId').then(id => {
      if (id === null) {
        axios.get('http://localhost:8082/user/new').then((data) => {
          store.save('userId', data.data)
          store.save('alarms', {})
          store.save('userSettings', {
            defaultPrepTime: 0,
            defaultPostTime: 0,
            defaultSnoozes: 0,
          })
          this.setState({
            userId: data.data,
            first: true,
          }, () => {
            this.props.navigation.navigate('SettingsScreen', {
              userId: this.state.userId,
            });
          });
        });
      } else {
        store.get('userSettings').then((settings) => {
          console.log(settings);
          this.setState({
            userId: id,
            userSettings: settings
          })
        }).then(() => {
          store.get('alarms').then(alarms => {
            console.log(alarms);
            this.setState({
              alarms: Object.keys(alarms).map(k => {
                alarms[k].id = k;
                return alarms[k];
              }),
            });
          });
        })
      }
    });
  }

  toAddScreen(item) {
    this.props.navigation.navigate('AddScreen', {
      data: item,
      userId: this.state.userId,
    })
  }

  renderItem(data) {
    let { item, index } = data;
    return (
      <View style={styles.itemBlock}>
        <FontAwesome style={styles.itemImage}>{Icons.clockO}</FontAwesome>
        <View style={styles.itemMeta}>
          <Text onPress = {() => this.toAddScreen(item)} style={styles.itemName}>{item.label}</Text>
          <Text style={styles.itemTime}>{item.time}</Text>
          <Text style={styles.itemLocation}>{item.location}</Text>
        </View>
      </View>
    )
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Alarms</Text>
      </View>
    )
  }

  renderSeparator() {
    return <View style={styles.separator} />
  }

  _onRefresh() {
    this.setState({
      refreshing: true
    })
    setTimeout(function() {
      this.setState({
        refreshing: false
      })
    }.bind(this),1000)
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ height: '90%' }}>
          <FlatList 
            //keyExtractor={this._keyExtractor}
            data={this.state.alarms}
            renderItem={this.renderItem.bind(this)}
            ItemSeparatorComponent={this.renderSeparator.bind(this)}
            ListHeaderComponent={this.renderHeader.bind(this)}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh.bind(this)}
              />
            }
          />
        </View>
        <BottomNavigation
          userId={this.state.userId}
          cur={1}
          nav={this.props.navigation}
          userSettings={this.state.userSettings}
          updateUserSettings={(prep, post, snooze) => {
            this.setState({
              userSettings: {
                defaultPrepTime: prep,
                defaultPostTime: post,
                defaultSnoozes: snooze,
              }
            })
          }}
        />
      </View>
    );
  }
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20,
    },
    itemBlock: {
      flexDirection: 'row',
      paddingBottom: 10,
    },
    itemImage: {
      width: 50,
      height: 50,
      borderRadius: 0,
    },
    itemMeta: {
      marginLeft: 10,
      justifyContent: 'center',
    },
    itemName: {
      fontSize: 20,
    },
    itemLocation: {
      fontSize: 12,
      color: "#111",
    },
    itemTime: {
      fontSize: 14,
      color: "#111",
    },
    separator: {
      height: 0.5,
      width: "200%",
      alignSelf: 'center',
      backgroundColor: "#555"
    },
    header: {
      padding: 10,
      alignSelf: 'center'
    },
    headerText: {
      fontSize: 30,
      fontWeight: '900'
    }
  });
