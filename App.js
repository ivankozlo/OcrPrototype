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
const MAX_SCAN_COUNT = 9
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
const validateVin = vin => vin.match(new RegExp("^[A-HJ-NPR-Z0-9oOIa-hj-npr-z]{8}[a-zA-Z0-9XoO][A-HJ-NPR-Z0-9oOIa-hj-npr-z]{2}[0-9]{6}$"))
const validateRegNum = num => num.match(new RegExp("^[0-9oO]{3}[.:,]?[0-9oO]{3}[.:,]?[0-9oO]{3}$"))
const validatePlateNum = num => num.match(new RegExp("^[A-Za-z0]{2}[0-9oO]{3,6}$"))
const validateRegDate = date => date.match(new RegExp("^[0-9]{2}[.:,]?[0-9]{2}[.:,]?[0-9]{2,4}$")) || date.match(new RegExp("^[0-9]{2}[.:,]?[0-9]{2}[.:,]?[0-9]{2,4}[a-zA-Z]{1,2}?$"))
const validateTypeNum = num => num.match(new RegExp("^[0-9oO][a-zA-Z0][a-zA-Z0-9]{1,2}[0-9oO]{3}$"))
export default class App extends Component {
  constructor () {
    super();
    this.state = {
      textDetected: false,
      nonce: 0,
      detectedValues: [],
      finalValues: []
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
    if(value.textBlocks.length != 0 && this.state.nonce <= MAX_SCAN_COUNT){
      let textBlocks = value.textBlocks.map(item => item.value.replace(/\s/g, "")).filter(item => (item.length == 1) || item.length >= 5 && item.length < 18)
      let vin = ''
      let regNum = ''
      let plateNum = ''
      let regDate = ''
      let typeNum = ''
      textBlocks.forEach(item => {
        if(validateVin(item)){
          vin = item
        }
        if(validateRegNum(item)){
          regNum = item
        }
        if(validatePlateNum(item)){
          plateNum = item 
        }
        if(validateRegDate(item)){
          regDate = item 
        }
        if(item == 'X' || item == 'x' || validateTypeNum(item)){
          typeNum = item 
        }
      })
      let detectedValue = {
        nonce: this.state.nonce,
        vin: vin,
        regNum: regNum,
        regDate: regDate,
        plateNum: plateNum,
        typeNum: typeNum
      }
      let detectedValues = this.state.detectedValues 
      if(vin || regNum || regDate || plateNum || typeNum){
        detectedValues.push(detectedValue)
      }
      this.setState({
        nonce: this.state.nonce + 1,
        detectedValues: detectedValues
      }, () => {
        this.interpretTextBlocks()
      })
    }
  }
  interpretTextBlocks = () => {
    let detectedValues = this.state.detectedValues
    let vin = {
      category: 'vin',
      values: [],
      scanRate: 0,
      duplicates: 0
    }
    let regDate = {
      category: 'regDate',
      values: [],
      scanRate: 0,
      duplicates: 0
    }
    let regNum = {
      category: 'regNum',
      values: [],
      scanRate: 0,
      duplicates: 0
    }
    let plateNum = {
      category: 'plateNum',
      values: [],
      scanRate: 0,
      duplicates: 0
    }
    let typeNum = {
      category: 'typeNum',
      values: [],
      scanRate: 0,
      duplicates: 0
    }
    detectedValues.forEach(item => {
      if(item.vin){
        if(vin.values.indexOf(item.vin) != -1){
          vin.duplicates++
        }
        vin.values.push(item.vin)
        vin.scanRate++ 
      }
      if(item.regNum){
        if(regNum.values.indexOf(item.regNum) != -1){
          regNum.duplicates++
        }
        regNum.values.push(item.regNum)
        regNum.scanRate++ 
      }
      if(item.plateNum){
        if(plateNum.values.indexOf(item.plateNum) != -1){
          plateNum.duplicates++
        }
        plateNum.values.push(item.plateNum)
        plateNum.scanRate++ 
      }
      if(item.typeNum){
        if(typeNum.values.indexOf(item.typeNum) != -1){
          typeNum.duplicates++
        }
        typeNum.values.push(item.typeNum)
        typeNum.scanRate++ 
      }
      if(item.regDate){
        if(regDate.values.indexOf(item.regDate) != -1){
          regDate.duplicates++
        }
        regDate.values.push(item.regDate)
        regDate.scanRate++ 
      }
    })
    if(vin.duplicates > 1 && regDate.duplicates > 1 && regNum.duplicates > 1 && typeNum.duplicates > 1 && plateNum.duplicates > 1 || this.state.nonce == 9){
      let finalValues = [vin, plateNum, typeNum, regNum, regDate]
      _log(finalValues, 'FINAL VALUES:')
      this.setState({
        textDetected: true,
        finalValues: [...finalValues]
      })
    }
  }
  reset = () => {
    this.setState({
      textDetected: false,
      nonce: 0,
      detectedValues: []
    })
  }
  render () {
    const { textDetected, finalValues, nonce } = this.state 
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
          <ScrollView style={{backgroundColor: 'white'}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white'}}>
              <Text style={{color: 'red'}}>{"Detected text blocks:"}</Text>
              {textDetected && <TouchableOpacity onPress={this.reset}>
                <Text>{'Rescan'}</Text>
              </TouchableOpacity>}
              {!textDetected && <Text>{'Scanning...'}</Text>}
            </View>
            {finalValues.length == 0 && <Text style={{fontSize: 12, color: 'black'}}>{
              `Please wait. Scan trying ${nonce} times...`
            }</Text>}
            {finalValues.length != 0 && 
              finalValues.map((item, idx) => {
                return (
                  <View key={idx}>
                    <Text style={{fontWeight: '900'}}>{item.category.toUpperCase()}</Text>
                    <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
                      <Text>{"Values: "}</Text>
                      {item.values.map((_item, _idx) => {
                        return(
                          <Text key={_idx}>{_item}</Text>
                        )
                      })}
                      <Text>{`Scan rate: ${item.scanRate / nonce * 100}%`}</Text>
                      <Text>{`Duplicates: ${item.duplicates}`}</Text>
                    </View>
                  </View>
                )
              })
            }
            <View style={{height: 200}}></View>
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

