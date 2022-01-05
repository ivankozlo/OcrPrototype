/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,Dimensions
} from 'react-native';

import { RNCamera } from 'react-native-camera';

const { width, height } = Dimensions.get("window");
export default class App extends Component {
  constructor () {
    super();
    this.state = {
      textDetected: false,
      textBlocks: []
    };
    this.camera = React.createRef()
  }
  onCameraReady = () => {
    console.log('CAMERA IS READY TO CAPTURE')
  }
  onCameraMountError = (err) => {
    console.log("[CameraView::onCameraMountError] err=", err);
  }
  onTextDetected = (value) => {
    if(value.textBlocks.length != 0){
      this.setState({
        textDetected: true,
        textBlocks: value.textBlocks.map(item => item.value)
      })
    }
    console.log(JSON.stringify(value.textBlocks.map(item => item.value), null, 2))
    this.setState({
      textDetected: true
    })
  }
  render () {
    const { textBlocks } = this.state 
    let detectedTexts = ''
    textBlocks.forEach(item => {
      detectedTexts += item + ', '
    })
    return (
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.content}>
            <View style={styles.camera}>
              <RNCamera
                ref={ref => {
                  this.camera = ref;
                }}
                trackingEnabled
                onTextRecognized={(value) => {
                  this.onTextDetected(value)
                }}
                captureAudio={false}
                mute={true}
                style={{
                  width: width,
                  height: height
                }}
                type={RNCamera.Constants.Type.back}
                onCameraReady={this.onCameraReady}
                onMountError={this.onCameraMountError}
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
              >
              </RNCamera>
            </View>
          </View>
        </ScrollView>
        <View style={{height: 200, margin: 20}}>
          <ScrollView>
            <Text style={{color: 'red'}}>{"Detected text block:"}</Text>
            <Text style={{fontSize: 12, color: 'black'}}>{
              detectedTexts
            }</Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    height: height-200,
    width: width,
    margin: 0
  },
  camera: {
    position: 'relative',
    backgroundColor: 'gray'
  },
  detectedTexts: {
    background: 'gray',
    height: 200
  }
});

