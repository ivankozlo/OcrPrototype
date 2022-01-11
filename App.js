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
const validateVin = vin => vin.match(new RegExp("^[a-zA-Z0-9]{12}[0-9iloOQzZDQBsGSJ]{5}$"))
const validateRegNum = num => num.match(new RegExp("^[0-9iloOQzZD]{3}[.:,]?[0-9iloOQzZD]{3}[.:,]?[0-9iloOQzZD]{3}$"))
const validatePlateNum = num => num.match(new RegExp("^AG|^AI|^AR|^BE|^BL|^BS|^FL|^FR|^GE|^GL|^GR|^JU|^LU|^NE|^NW|^OW|^SZ|^SH|^SO|^SG|^TG|^TI|^UR|^VD|^VS|^ZG|^ZH[0-9iloOQzZD]{3,6}$"))
const validateRegDate = date => date.match(new RegExp("^(0[1-9ilzZ]|[12il][0-9iloOQzZD]|3[01oOil])[.:,]?(0[1-9ilzZ]|1[0-2oOil])[.:,]?([1-2il][09oO][0-9iloOQzZD][0-9iloOQzZD]|[0-9iloOQzZD]{2})[a-zA-Z01]{0,2}$"))
const validateTypeNum = num => num.match(new RegExp("^[0-9iloOQzZD][a-zA-Z01][a-zA-Z0-9]{1,2}[0-9iloOQzZD]{3}$"))
export default class App extends Component {
  constructor () {
    super();
    this.state = {
      textDetected: false,
      nonce: 0,
      detectedValues: [],
      finalValues: [],
      candidates: []
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
      let textBlocks = value.textBlocks.map(item => item.value.replace(/\s/g, "")).filter(item => (item.length == 1) || item.length >= 5 && item.length < 19)
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
          regNum = item.replace(/[.]/g, '')
        }
        if(validatePlateNum(item)){
          plateNum = item 
        }
        if(validateRegDate(item)){
          regDate = item.replace(/[^\d]/g, '')
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
      duplicates: 0,
      characters: []
    }
    let regDate = {
      category: 'regDate',
      values: [],
      scanRate: 0,
      duplicates: 0,
      characters: []
    }
    let regNum = {
      category: 'regNum',
      values: [],
      scanRate: 0,
      duplicates: 0,
      characters: []
    }
    let plateNum = {
      category: 'plateNum',
      values: [],
      scanRate: 0,
      duplicates: 0,
      characters: []
    }
    let typeNum = {
      category: 'typeNum',
      values: [],
      scanRate: 0,
      duplicates: 0,
      characters: []
    }
    detectedValues.forEach(item => {
      if(item.vin){
        if(vin.values.indexOf(item.vin) != -1){
          vin.duplicates++
        }
        vin.values.push(item.vin)
        vin.scanRate++ 
        item.vin.split('').forEach((char, index) => {
          vin.characters.push({
            char: char, 
            pos: index
          })
        })
      }
      if(item.regNum){
        if(regNum.values.indexOf(item.regNum) != -1){
          regNum.duplicates++
        }
        regNum.values.push(item.regNum)
        regNum.scanRate++ 
        item.regNum.split('').forEach((char, index) => {
          regNum.characters.push({
            char: char, 
            pos: index
          })
        })
      }
      if(item.plateNum){
        if(plateNum.values.indexOf(item.plateNum) != -1){
          plateNum.duplicates++
        }
        plateNum.values.push(item.plateNum)
        plateNum.scanRate++ 
        item.plateNum.split('').forEach((char, index) => {
          plateNum.characters.push({
            char: char, 
            pos: index
          })
        })
      }
      if(item.typeNum){
        if(typeNum.values.indexOf(item.typeNum) != -1){
          typeNum.duplicates++
        }
        typeNum.values.push(item.typeNum)
        typeNum.scanRate++ 
        item.typeNum.split('').forEach((char, index) => {
          typeNum.characters.push({
            char: char, 
            pos: index
          })
        })
      }
      if(item.regDate){
        if(regDate.values.indexOf(item.regDate) != -1){
          regDate.duplicates++
        }
        regDate.values.push(item.regDate)
        regDate.scanRate++ 
        item.regDate.split('').forEach((char, index) => {
          regDate.characters.push({
            char: char, 
            pos: index
          })
        })
      }
    })
    vin.characterArray = [...this.interpretCharacters(vin)]
    plateNum.characterArray = [...this.interpretCharacters(plateNum)]
    typeNum.characterArray = [...this.interpretCharacters(typeNum)]
    regNum.characterArray = [...this.interpretCharacters(regNum)]
    regDate.characterArray = [...this.interpretCharacters(regDate)]
    let finalValues = [vin, plateNum, typeNum, regNum, regDate]
    this.setState({
      finalValues: [...finalValues]
    })
    if(vin.duplicates > 1 && regDate.duplicates > 1 && regNum.duplicates > 1 && typeNum.duplicates > 1 && plateNum.duplicates > 1 || this.state.nonce == 9){
      //_log(finalValues, 'FINAL VALUES:')
      this.setState({
        textDetected: true
      })
    }
  }
  interpretCharacters = (data) => {
    let characters = data.characters 
    let characterArray = []
    let length = 0
    characters.forEach(item => {
      if(item.pos > length){
        length = item.pos + 1
      }
    })
    for(let i = 0; i <= length; i++){
      let chars = []
      characters.forEach(item => {
        if(i == item.pos){
          chars.push(item.char)
        }
      })
      let temp = {
        pos: i,
        characters: [...chars],
        uniqChars: [...new Set(chars)],
        details: [...new Set(chars)].map(item => {
          let occurence = countOccurrences(chars, item)
          return {
            occurence: occurence,
            char: item,
            percent: occurence / chars.length * 100
          }
        })
      }
      let maxPercent = 0
      let candidate = {
        percent: 0,
        char: '',
        occurence: 0
      }
      temp.details.forEach(item => {
        if(maxPercent < item.percent){
          maxPercent = item.percent
          candidate.percent = maxPercent
          candidate.char = item.char
          candidate.occurence = item.occurence
        }
      })
      temp.candidate = candidate
      characterArray.push(temp)
    }
    return characterArray
  }
  reset = () => {
    this.setState({
      textDetected: false,
      nonce: 0,
      detectedValues: [],
      finalValues: [],
      candidates: []
    })
  }
  render () {
    const { textDetected, finalValues, nonce, detectedValues } = this.state 
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
            {/* {finalValues.length == 0 && 
              <View>
                <Text style={{fontSize: 12, color: 'black'}}>{
                  `Please wait. Scan trying ${nonce} times...`
                }</Text>
                <View>
                  {detectedValues.length != 0 && <View style={{marginLeft: 10}}>
                      <Text style={{color: 'black'}}>{`Scan index: ${detectedValues[detectedValues.length - 1].nonce}`}</Text>
                      <Text style={{color: 'black'}}>{`VIN: ${detectedValues[detectedValues.length - 1].vin}`}</Text>
                      <Text style={{color: 'black'}}>{`regDate: ${detectedValues[detectedValues.length - 1].regDate}`}</Text>
                      <Text style={{color: 'black'}}>{`regNum: ${detectedValues[detectedValues.length - 1].regNum}`}</Text>
                      <Text style={{color: 'black'}}>{`plateNum: ${detectedValues[detectedValues.length - 1].plateNum}`}</Text>
                      <Text style={{color: 'black'}}>{`typeNum: ${detectedValues[detectedValues.length - 1].typeNum}`}</Text>
                    </View>}
                </View>
              </View>
            } */}
            {finalValues.length != 0 &&
              finalValues.map((item, idx) => {
                let candidate = ''
                let detail = ''
                item.characterArray.forEach(_item => {
                  candidate = candidate + _item.candidate.char
                  let temp = `\n${_item.pos}: `
                  _item.details.forEach(__item => {
                    temp += `${__item.char} x ${__item.occurence} (${__item.percent.toFixed(2)}%),` 
                  })
                  detail += temp
                })
                return (
                  <View key={idx}>
                    <Text style={{fontWeight: '900', color: 'black'}}>{item.category.toUpperCase()}</Text>
                    <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
                      <Text style={{color: 'black'}}>{"Candidate: " + candidate}</Text>
                      <Text style={{color: 'black'}}>{"Details: " + detail}</Text>
                      <Text style={{color: 'black'}}>{"Values: "}</Text>
                      {item.values.map((_item, _idx) => {
                        return(
                          <Text style={{marginLeft: 10, color: 'black'}} key={_idx}>{_item}</Text>
                        )
                      })}
                      {/* <Text>{`Scan rate: ${item.scanRate / nonce * 100}%`}</Text>
                      <Text>{`Duplicates: ${item.duplicates}`}</Text> */}
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

