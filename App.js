
import React, { Component } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Image, View,Dimensions, TouchableOpacity } from 'react-native';

import { RNCamera } from 'react-native-camera';

const { width, height } = Dimensions.get("window");
const ratio = width / 1080
const _log = (val, desc = '') => {
  console.log(desc, JSON.stringify(val, null, 2))
}
const MAX_SCAN_COUNT = 9
const REDBOX_COORDINATION = {
  plateNum: {
    x1: 210 * ratio,
    x2: 620 * ratio,
    y1: 10 * ratio, 
    y2: 90 * ratio 
  },
  vin: {
    x1: 270 * ratio,
    x2: 950 * ratio,
    y1: 340 * ratio,
    y2: 420 * ratio
  },
  extColor: {
    x1: 270 * ratio,
    x2: 770 * ratio,
    y1: 510 * ratio,
    y2: 590 * ratio
  },
  regNum: {
    x1: 270 * ratio,
    x2: 520 * ratio,
    y1: 690 * ratio,
    y2: 770 * ratio
  },
  typeNum: {
    x1: 270 * ratio,
    x2: 520 * ratio,
    y1: 780 * ratio,
    y2: 860 * ratio
  },
  regDate: {
    x1: 270 * ratio,
    x2: 530 * ratio,
    y1: 1130 * ratio,
    y2: 1210 * ratio
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


const validateByArea = (category, pos) => {
  let f = REDBOX_COORDINATION[category] // filter area
  let d = {
    x1: pos.x,
    x2: pos.x + pos.width,
    y1: pos.y, 
    y2: pos.y + pos.height 
  } // detection area
  if(d.x2 < f.x1 || f.x2 < d.x1){
    return false 
  }
  if(d.y2 < f.y1 || f.y2 < d.y1){
    return false 
  }
  return true 
}
export default class App extends Component {
  constructor () {
    super();
    this.state = {
      textDetected: false,
      nonce: 0,
      detectedValues: [],
      finalValues: [],
      candidates: [],
      withBox: false,
      lastDetected: {},
      plateNumDetectionArea: {
        x:0, y:0, width:0, height:0
      },
      vinDetectionArea: {
        x:0, y:0, width:0, height:0
      },
      extColorDetectionArea: {
        x:0, y:0, width:0, height:0
      },
      regNumDetectionArea: {
        x:0, y:0, width:0, height:0
      },
      typeNumDetectionArea: {
        x:0, y:0, width:0, height:0
      },
      regDateDetectionArea: {
        x:0, y:0, width:0, height:0
      },
    };
    this.camera = React.createRef()
  }
  onCameraReady = () => {
    console.log('**************************  CAMERA IS READY TO CAPTURE  ***************************')
  }
  onCameraMountError = (err) => {
    _log(err, 'Camera load error:')
  }
  
  onTextDetected = (value) => {
    if(value.textBlocks.length != 0 && this.state.nonce <= MAX_SCAN_COUNT){
      let textBlocks = value.textBlocks.map(item => {
        return {
          value: item.value.replace(/\s/g, ""),
          position: {
            x: item.bounds.origin.x,
            y: item.bounds.origin.y,
            width: item.bounds.size.width,
            height: item.bounds.size.height
          }
        }
      }).filter(item => (item.value.length == 1) || item.value.length >= 5 && item.value.length < 19)
      let vin = ''
      let regNum = ''
      let plateNum = ''
      let regDate = ''
      let typeNum = ''
      let extColor = ''
      textBlocks.forEach(item => {
        if(validateByArea('plateNum', item.position)){
          if(plateNum == ''){
            plateNum = item.value
            this.setState({
              plateNumDetectionArea: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height
              }
            })
            _log(item, 'Plate number:')
          }
        }
        if(validateByArea('vin', item.position)){
          if(vin == ''){
            vin = item.value
            this.setState({
              vinDetectionArea: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height
              }
            })
            _log(item, 'VIN:')
          }
        }
        if(validateByArea('extColor', item.position)){
          if(extColor == ''){
            extColor = item.value
            this.setState({
              extColorDetectionArea: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height
              }
            })
            _log(item, 'Ext color:')
          }
        }
        if(validateByArea('regNum', item.position)){
          if(regNum == ''){
            regNum = item.value
            this.setState({
              regNumDetectionArea: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height
              }
            })
            _log(item, 'Reg number:')
          }
        }
        if(validateByArea('typeNum', item.position)){
          if(typeNum == ''){
            typeNum = item.value
            this.setState({
              typeNumDetectionArea: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height
              }
            })
            _log(item, 'Type number:')
          }
        }
        if(validateByArea('regDate', item.position)){
          if(regDate == ''){
            regDate = item.value
            this.setState({
              regDateDetectionArea: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height
              }
            })
            _log(item, 'Reg date:')
          }
        }
        // if(validateByRegexVin(item.value)){
        //   if(vin == ''){
        //     vin = item.value
        //     this.setState({
        //       vinDetectionArea: {
        //         x: item.position.x,
        //         y: item.position.y,
        //         width: item.position.width,
        //         height: item.position.height
        //       }
        //     })
        //     //_log(item, 'VIN POS:')
        //   }
        // }
        // if(validateByRegexRegNum(item.value)){
        //   if(regNum == ''){
        //     regNum = item.value.replace(/[.]/g, '')
        //     this.setState({
        //       regNumDetectionArea: {
        //         x: item.position.x,
        //         y: item.position.y,
        //         width: item.position.width,
        //         height: item.position.height
        //       }
        //     })
        //     //_log(item, 'REG NUMBER POS:')
        //   }
        // }
        // if(validateByRegexPlateNum(item.value)){
        //   if(plateNum == ''){
        //     plateNum = item.value 
        //     this.setState({
        //       plateNumDetectionArea: {
        //         x: item.position.x,
        //         y: item.position.y,
        //         width: item.position.width,
        //         height: item.position.height
        //       }
        //     })
        //   }
        // }
        // if(validateByRegexRegDate(item.value)){
        //   if(regDate == ''){
        //     regDate = item.value.replace(/[^\d]/g, '')
        //     this.setState({
        //       regDateDetectionArea: {
        //         x: item.position.x,
        //         y: item.position.y,
        //         width: item.position.width,
        //         height: item.position.height
        //       }
        //     })
        //   }
        // }
        // if(item.value == 'X' || item.value == 'x' || validateByRegexTypeNum(item.value)){
        //   if(typeNum == ''){
        //     typeNum = item.value
        //     this.setState({
        //       typeNumDetectionArea: {
        //         x: item.position.x,
        //         y: item.position.y,
        //         width: item.position.width,
        //         height: item.position.height
        //       }
        //     })
        //   } 
        // }
      })
      let detectedValue = {
        nonce: this.state.nonce,
        vin: vin,
        regNum: regNum,
        regDate: regDate,
        plateNum: plateNum,
        typeNum: typeNum,
        extColor: extColor
      }
      let detectedValues = this.state.detectedValues 
      if(vin || regNum || regDate || plateNum || typeNum || extColor){
        //_log(detectedValue, 'DETECTED VALUES FROM ABOVE SCAN:')
        detectedValues.push(detectedValue)
      }
      this.setState({
        nonce: this.state.nonce + 1,
        detectedValues: detectedValues,
        lastDetected: detectedValue
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
    let extColor = {
      category: 'extColor',
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
      if(item.extColor){
        if(extColor.values.indexOf(item.extColor) != -1){
          extColor.duplicates++
        }
        extColor.values.push(item.extColor)
        extColor.scanRate++ 
        item.extColor.split('').forEach((char, index) => {
          extColor.characters.push({
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
    extColor.characterArray = [...this.interpretCharacters(extColor)]
    vin.maxLength = getMostDuplicatesLength(vin.values.map(item => item.length))
    plateNum.maxLength = getMostDuplicatesLength(plateNum.values.map(item => item.length))
    typeNum.maxLength = getMostDuplicatesLength(typeNum.values.map(item => item.length))
    regNum.maxLength = getMostDuplicatesLength(regNum.values.map(item => item.length))
    regDate.maxLength = getMostDuplicatesLength(regDate.values.map(item => item.length))
    extColor.maxLength = getMostDuplicatesLength(extColor.values.map(item => item.length))
    let finalValues = [plateNum, vin, extColor, regNum, typeNum, regDate]
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
    const { textDetected, finalValues, detectedValues, lastDetected, nonce, regDateDetectionArea, plateNumDetectionArea, vinDetectionArea, typeNumDetectionArea, regNumDetectionArea, extColorDetectionArea } = this.state 
    
    const PlateNumDetection = () => {
      return (
        <>
          <View style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            top: REDBOX_COORDINATION.plateNum.y1,
            left: REDBOX_COORDINATION.plateNum.x1,
            width: REDBOX_COORDINATION.plateNum.x2 - REDBOX_COORDINATION.plateNum.x1,
            height: REDBOX_COORDINATION.plateNum.y2 - REDBOX_COORDINATION.plateNum.y1
          }} />
          <View style={{
            position: 'absolute',
            borderColor: 'blue',
            borderWidth: 2,
            top: plateNumDetectionArea.y,
            left: plateNumDetectionArea.x,
            width: plateNumDetectionArea.width,
            height: plateNumDetectionArea.height
          }}/>
          <Text style={{
            color:'black', 
            fontSize:14, 
            zIndex: 999, 
            position: 'absolute', 
            top: plateNumDetectionArea.y,
            left: plateNumDetectionArea.x,
          }}>{lastDetected.plateNum}</Text>
        </>
      )
    }
    const VinDetection = () => {
      return (
        <>
          <View style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            top: REDBOX_COORDINATION.vin.y1,
            left: REDBOX_COORDINATION.vin.x1,
            width: REDBOX_COORDINATION.vin.x2 - REDBOX_COORDINATION.vin.x1,
            height: REDBOX_COORDINATION.vin.y2 - REDBOX_COORDINATION.vin.y1
          }} />
          <View style={{
            position: 'absolute',
            borderColor: 'blue',
            borderWidth: 2,
            top: vinDetectionArea.y,
            left: vinDetectionArea.x,
            width: vinDetectionArea.width,
            height: vinDetectionArea.height
          }} />
          <Text style={{
            color:'black', 
            fontSize:14, 
            zIndex: 999, 
            position: 'absolute', 
            top: vinDetectionArea.y,
            left: vinDetectionArea.x,
          }}>{lastDetected.vin}</Text>
        </>
      )
    }
    const ExtColorDetection = () => {
      return (
        <>
          <View style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            top: REDBOX_COORDINATION.extColor.y1,
            left: REDBOX_COORDINATION.extColor.x1,
            width: REDBOX_COORDINATION.extColor.x2 - REDBOX_COORDINATION.extColor.x1,
            height: REDBOX_COORDINATION.extColor.y2 - REDBOX_COORDINATION.extColor.y1
          }} />
          <View style={{
            position: 'absolute',
            borderColor: 'blue',
            borderWidth: 2,
            top: extColorDetectionArea.y,
            left: extColorDetectionArea.x,
            width: extColorDetectionArea.width,
            height: extColorDetectionArea.height
          }} />
          <Text style={{
            color:'black', 
            fontSize:14, 
            zIndex: 999, 
            position: 'absolute', 
            top: extColorDetectionArea.y,
            left: extColorDetectionArea.x,
          }}>{lastDetected.extColor}</Text>
        </>
      )
    }
    const RegNumDetection = () => {
      return (
        <>
          <View style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            top: REDBOX_COORDINATION.regNum.y1,
            left: REDBOX_COORDINATION.regNum.x1,
            width: REDBOX_COORDINATION.regNum.x2 - REDBOX_COORDINATION.regNum.x1,
            height: REDBOX_COORDINATION.regNum.y2 - REDBOX_COORDINATION.regNum.y1
          }} />
          <View style={{
            position: 'absolute',
            borderColor: 'blue',
            borderWidth: 2,
            top: regNumDetectionArea.y,
            left: regNumDetectionArea.x,
            width: regNumDetectionArea.width,
            height: regNumDetectionArea.height
          }} />
          <Text style={{
            color:'black', 
            fontSize:14, 
            zIndex: 999, 
            position: 'absolute', 
            top: regNumDetectionArea.y,
            left: regNumDetectionArea.x,
          }}>{lastDetected.regNum}</Text>
        </>
      )
    }
    const TypeNumDetection = () => {
      return (
        <>
          <View style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            top: REDBOX_COORDINATION.typeNum.y1,
            left: REDBOX_COORDINATION.typeNum.x1,
            width: REDBOX_COORDINATION.typeNum.x2 - REDBOX_COORDINATION.typeNum.x1,
            height: REDBOX_COORDINATION.typeNum.y2 - REDBOX_COORDINATION.typeNum.y1
          }} />
          <View style={{
            position: 'absolute',
            borderColor: 'blue',
            borderWidth: 2,
            top: typeNumDetectionArea.y,
            left: typeNumDetectionArea.x,
            width: typeNumDetectionArea.width,
            height: typeNumDetectionArea.height
          }} />
          <Text style={{
            color:'black', 
            fontSize:14, 
            zIndex: 999, 
            position: 'absolute', 
            top: typeNumDetectionArea.y,
            left: typeNumDetectionArea.x,
          }}>{lastDetected.typeNum}</Text>
        </>
      )
    }
    const RegDateDetection = () => {
      return (
        <>
          <View style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            top: REDBOX_COORDINATION.regDate.y1,
            left: REDBOX_COORDINATION.regDate.x1,
            width: REDBOX_COORDINATION.regDate.x2 - REDBOX_COORDINATION.regDate.x1,
            height: REDBOX_COORDINATION.regDate.y2 - REDBOX_COORDINATION.regDate.y1
          }} />
          <View style={{
            position: 'absolute',
            borderColor: 'blue',
            borderWidth: 2,
            top: regDateDetectionArea.y,
            left: regDateDetectionArea.x,
            width: regDateDetectionArea.width,
            height: regDateDetectionArea.height
          }} />
          <Text style={{
            color:'black', 
            fontSize:14, 
            zIndex: 999, 
            position: 'absolute', 
            top: regDateDetectionArea.y,
            left: regDateDetectionArea.x,
          }}>{lastDetected.regDate}</Text>
        </>
      )
    }
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
                  height: 1920 * ratio,
                  margin: 0,
                  position: 'relative',
                }}
                zoom={0}
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
                      height: 1920 * ratio,
                    }}
                    resizeMode={"contain"}
                    source={this.state.withBox ? require('./assets/doc_box.png') : require('./assets/doc.png')}
                  />
                  <PlateNumDetection />
                  <VinDetection />
                  <ExtColorDetection />
                  <RegNumDetection />
                  <TypeNumDetection />
                  <RegDateDetection />
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

