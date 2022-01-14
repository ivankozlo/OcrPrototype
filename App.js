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
  Image,
  View,Dimensions, TouchableOpacity
} from 'react-native';

import { RNCamera } from 'react-native-camera';
import { FileLogger } from "react-native-file-logger"

const { width, height } = Dimensions.get("window");
const _log = (val, desc = '') => {
  console.log(desc, JSON.stringify(val, null, 2))
}
const MAX_SCAN_COUNT = 9
const REDBOX_COORDINATION = {
  plateNum: {
    x1: 210, // 140
    x2: 620, // 413
    y1: 10, //6.67
    y2: 90 // 60
  },
  vin: {
    x1: 270,
    x2: 950,
    y1: 340,
    y2: 420
  },
  extColor: {
    x1: 270,
    x2: 770,
    y1: 510,
    y2: 590
  },
  regNum: {
    x1: 270,
    x2: 520,
    y1: 690,
    y2: 770
  },
  typeNum: {
    x1: 270,
    x2: 520,
    y1: 780,
    y2: 860
  },
  regDate: {
    x1: 270,
    x2: 530,
    y1: 1130,
    y2: 1210
  }
}
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
const getMostDuplicatesLength = arr => {
  let counts = {}, max = 0
  for (let v in arr) {
    counts[arr[v]] = (counts[arr[v]] || 0) + 1
    if (counts[arr[v]] > max) { 
      max = counts[arr[v]]
    }
  }
  for (let v in arr) {
    if(counts[arr[v]] == max){
      return arr[v]
    }
  }
  return 0
}
const validateByRegexVin = vin => vin.match(new RegExp("^[a-zA-Z0-9]{12}[0-9iloOQzZDQBsGSJ]{5}$"))
const validateByRegexRegNum = num => num.match(new RegExp("^[0-9iloOQzZD]{3}[.:,]?[0-9iloOQzZD]{3}[.:,]?[0-9iloOQzZD]{3}$"))
const validateByRegexPlateNum = num => num.match(new RegExp("(^AG|^AI|^AR|^BE|^BL|^BS|^FL|^FR|^GE|^GL|^GR|^JU|^LU|^NE|^NW|^OW|^SZ|^SH|^SO|^SG|^TG|^TI|^UR|^VD|^VS|^ZG|^ZH)[0-9iloOQzZD]{3,6}$"))
const validateByRegexRegDate = date => date.match(new RegExp("^(0[1-9ilzZ]|[12il][0-9iloOQzZD]|3[01oOil])[.:,]?(0[1-9ilzZ]|1[0-2oOil])[.:,]?([1-2il][09oO][0-9iloOQzZD][0-9iloOQzZD]|[0-9iloOQzZD]{2})[a-zA-Z01]{0,2}$"))
const validateByRegexTypeNum = num => num.match(new RegExp("^[0-9iloOQzZD][a-zA-Z01][a-zA-Z0-9]{1,2}[0-9iloOQzZD]{3}$"))
const validateByRegexExtColor = color => color.match(new RegExp("^[a-z]$"))

export default class App extends Component {
  constructor () {
    super();
    this.state = {
      textDetected: false,
      nonce: 0,
      detectedValues: [],
      finalValues: [],
      candidates: [],
      withBox: false
    };
    this.camera = React.createRef()
  }
  onCameraReady = () => {
    console.log('**************************  CAMERA IS READY TO CAPTURE  ***************************')
    _log({width, height}, 'DIMENSIONS:')
  }
  onCameraMountError = (err) => {
    console.log("[CameraView::onCameraMountError] err=", err);
  }
  
  onTextDetected = (value) => {
    if(value.textBlocks.length != 0 && this.state.nonce <= MAX_SCAN_COUNT){
      _log(value.textBlocks.map(item => {
        return {
          value: item.value.replace(/\s/g, ""),
          position: {
            x1: item.bounds.origin.x,
            y1: item.bounds.origin.y,
            x2: item.bounds.origin.x + item.bounds.size.width,
            y2: item.bounds.origin.y + item.bounds.size.height
          }
        }
      }), `####################### SCAN INDEX #${this.state.nonce}: SCANNED VALUES #######################\n`)
      let textBlocks = value.textBlocks.map(item => {
        return {
          value: item.value.replace(/\s/g, ""),
          position: {
            x1: item.bounds.origin.x,
            y1: item.bounds.origin.y,
            x2: item.bounds.origin.x + item.bounds.size.width,
            y2: item.bounds.origin.y + item.bounds.size.height
          }
        }
      }).filter(item => (item.value.length == 1) || item.value.length >= 5 && item.value.length < 19)
      let vin = ''
      let regNum = ''
      let plateNum = ''
      let regDate = ''
      let typeNum = ''
      textBlocks.forEach(item => {
        if(validateByRegexVin(item.value)){
          if(vin == ''){
            vin = item.value
            //_log(item, 'VIN POS:')
          }
        }
        if(validateByRegexRegNum(item.value)){
          if(regNum == ''){
            regNum = item.value.replace(/[.]/g, '')
            //_log(item, 'REG NUMBER POS:')
          }
        }
        if(validateByRegexPlateNum(item.value)){
          if(plateNum == ''){
            plateNum = item.value 
            _log(item, 'PLATE NUMBER POS:')
          }
        }
        if(validateByRegexRegDate(item.value)){
          if(regDate == ''){
            regDate = item.value.replace(/[^\d]/g, '')
            //_log(item, 'REG DATE POS:')
          }
        }
        if(item.value == 'X' || item.value == 'x' || validateByRegexTypeNum(item.value)){
          if(typeNum == ''){
            typeNum = item.value
            //_log(item, 'TYPE NUMBER POS:')
          } 
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
        //_log(detectedValue, 'DETECTED VALUES FROM ABOVE SCAN:')
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
    vin.maxLength = getMostDuplicatesLength(vin.values.map(item => item.length))
    plateNum.maxLength = getMostDuplicatesLength(plateNum.values.map(item => item.length))
    typeNum.maxLength = getMostDuplicatesLength(typeNum.values.map(item => item.length))
    regNum.maxLength = getMostDuplicatesLength(regNum.values.map(item => item.length))
    regDate.maxLength = getMostDuplicatesLength(regDate.values.map(item => item.length))
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
  changeBox = () => {
    this.setState({
      withBox: !this.state.withBox
    })
  }
  render () {
    const { textDetected, finalValues, nonce, detectedValues } = this.state 
    return (
      <SafeAreaView style={{margin: 0}}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{margin: 0, width: width, height: height}}>
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
                  height: height,
                  margin: 0,
                  position: 'relative',
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
                <View style={{flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <TouchableOpacity 
                    onPress={this.changeBox}
                    style={{backgroundColor: 'gray',  padding: 10, position: 'absolute', top: 10, right: 10, zIndex:10}}>
                    <Text style={{color: 'white'}}>{this.state.withBox ? 'Hide box' : 'Show box'}</Text>
                  </TouchableOpacity>
                  <Image
                    style={{
                      width: width,
                      height: height,
                    }}
                    resizeMode={"contain"}
                    source={this.state.withBox ? require('./assets/doc_box.png') : require('./assets/doc.png')}
                  />
                  {/*
                    x1: 210, // 140
                    x2: 620, // 413
                    y1: 10, //6.67
                    y2: 90 // 60
                  */}
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    top: 23,
                    left: 70,
                    width: 137,
                    height: 27
                  }} />
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    top: 133,
                    left: 88,
                    width: 230,
                    height: 27
                  }} />
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    top: 191,
                    left: 88,
                    width: 169,
                    height: 27
                  }} />
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    top: 246,
                    left: 88,
                    width: 85,
                    height: 27
                  }} />
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    top: 276,
                    left: 88,
                    width: 85,
                    height: 27
                  }} />
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    top: 396,
                    left: 88,
                    width: 85,
                    height: 27
                  }} />
                </View>
              </RNCamera>
            </View>
          </View>
        </ScrollView>
        <View style={{height: 200, position: 'absolute', bottom: 0, left: 0, width: width, opacity: 1}}>
          <ScrollView style={{backgroundColor: 'transparent'}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent'}}>
              <Text style={{color: 'red'}}>{"Detected text blocks:"}</Text>
              {textDetected && <TouchableOpacity onPress={this.reset}>
                <Text>{'Rescan'}</Text>
              </TouchableOpacity>}
              {!textDetected && <Text>{'Scanning...'}</Text>}
            </View>

            {finalValues.length != 0 &&
              finalValues.map((item, idx) => {
                let candidate = ''
                let detail = ''
                item.characterArray.forEach((_item, index) => {
                  if(index < item.maxLength){
                    candidate = candidate + _item.candidate.char
                  }
                  let temp = `\n${_item.pos}: `
                  _item.details.forEach(__item => {
                    temp += `${__item.char} x ${__item.occurence} (${__item.percent.toFixed(2)}%),` 
                  })
                  detail += temp
                })
                return (
                  <View key={idx}>
                    <Text style={{fontWeight: '900', color: 'white'}}>{item.category.toUpperCase()}</Text>
                    <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
                      <Text style={{color: 'white'}}>{"Candidate: " + candidate}</Text>
                      <Text style={{color: 'white'}}>{"Details: " + detail}</Text>
                      <Text style={{color: 'white'}}>{"Values: "}</Text>
                      {item.values.map((_item, _idx) => {
                        return(
                          <Text style={{marginLeft: 10, color: 'white'}} key={_idx}>{_item}</Text>
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
    height: height,
    width: width,
    margin: 0
  },
  camera: {
    position: 'relative',
    backgroundColor: 'gray',
    margin: 0
  },
  detectedTexts: {
    background: 'gray',
    height: 200
  }
});

