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
  StyleSheet,
  Text,
  View,Dimensions, TouchableOpacity
} from 'react-native';

import { RNCamera } from 'react-native-camera';

const { width, height } = Dimensions.get("window");
const _log = (val, desc = '') => {
  console.log(desc, JSON.stringify(val, null, 2))
}
const MAX_OCCURENCE = 3
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
export default class App extends Component {
  constructor () {
    super();
    this.state = {
      textDetected: false,
      textBlocks: [],
      nonce: 0,
      frequencyTexts: []
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
    if(value.textBlocks.length != 0 && !this.state.textDetected){
      let textBlocks = value.textBlocks.map(item => item.value.trim()).filter(item => item.length > 5 && item.length < 25)
      let oldBlocks = [...this.state.textBlocks]
      oldBlocks.push({
        nonce: this.state.nonce, 
        block: textBlocks
      })
      this.setState({
        textBlocks: oldBlocks,
        nonce: this.state.nonce + 1
      }, () => {
        this.interpretTextBlocks()
      })
    }
  }
  interpretTextBlocks = () => {
    const { textBlocks } = this.state 
    let duplicatedTextBlock = []
    let tempTextBlock = []
    let count = 0 
    let flag = false
    textBlocks.forEach(item => {
      tempTextBlock.push(...item.block)
    })
    tempTextBlock.forEach(item => {
      count = countOccurrences(tempTextBlock, item)
      if(count >= MAX_OCCURENCE){
        flag = true
      }
      duplicatedTextBlock.push({
        text: item,
        occurence: count
      })
    })
    
    duplicatedTextBlock.sort((a, b) => a.occurence > b.occurence ? -1 : 1)
    if(flag){
      const filtered = duplicatedTextBlock.reduce((acc, current) => {
        const x = acc.find(item => item.text === current.text);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      _log(filtered, 'FINAL DETECTION:')
      this.setState({
        textDetected: true,
        frequencyTexts: filtered
      })
    }
  }
  reset = () => {
    this.setState({
      textDetected: false,
      frequencyTexts: [],
      textBlocks: [],
      nonce: 0
    })
  }
  render () {
    const { nonce, frequencyTexts, textDetected } = this.state 
    // textBlocks.forEach(item => {
    //   detectedTexts += item + ', '
    // })
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
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{color: 'red'}}>{"Detected text blocks:"}</Text>
              {textDetected && <TouchableOpacity onPress={this.reset}>
                <Text>{'Rescan'}</Text>
              </TouchableOpacity>}
              {!textDetected && <Text>{'Scanning...'}</Text>}
            </View>
            {frequencyTexts.length == 0 && <Text style={{fontSize: 12, color: 'black'}}>{
              `Please wait. Scan trying ${nonce} times...`
            }</Text>}
            {frequencyTexts.length != 0 && <View>
              {frequencyTexts.map(item => {
                return <Text style={{fontSize: 12, color: 'black'}}>{
                  `Text: ${item.text}, Occurence: ${item.occurence}`
                }</Text>
              })}
            </View>}
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

