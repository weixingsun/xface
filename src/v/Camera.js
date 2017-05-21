import React from 'react';
import {Alert, AsyncStorage,Dimensions, Image, ListView, Platform, StyleSheet, Text, TouchableHighlight, View, } from "react-native";
import {Actions} from "react-native-router-flux";
import Icon from 'react-native-vector-icons/FontAwesome';
import IIcon from 'react-native-vector-icons/Ionicons';
import I18n from 'react-native-i18n';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import styles from '../style'
//import Const from '../Const'
import Global from '../Global'
import * as Animatable from 'react-native-animatable'
import Button from 'apsl-react-native-button'
//import { Worker } from 'react-native-workers';
import Camera from 'react-native-camera'
//import OpenCV from 'react-native-opencv';

export default class CameraPage extends React.Component {
    constructor(props) {
        super(props);
        this.ds= new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={ 
            type:'front',
        }
        this.renderReverse=this.renderReverse.bind(this)
        this.reverseCamera=this.reverseCamera.bind(this)
        //this.chooseServer=this.chooseServer.bind(this)
        //this.listenAction=this.listenAction.bind(this)
    }
    componentWillMount() {
        //this.updateWithActionIcon()
        this.updateWithActionIcon()
    }
    componentWillUnmount(){
        //this.stopAll()
        this.updateUI=false
        this.updateWithActionIcon()
    }
    updateWithActionIcon(){
        Actions.refresh({
            //key:'camera',
            renderRightButton: this.renderReverse,
        });
    }
    chooseServer(value){
        //if(value===''){
            //this.changeRole(true)
            //Actions.server({})
        //}else {
            this.updateUI=false
            let svr = this.state.servers[value]
            //alert('value='+value+'\n'+JSON.stringify(this.state.servers))
            Actions.client({server:svr})
        //}
    }
    renderReverse(){
        //{this.renderMoreOption('task_start','','plus')}
        return (
          <View style={{ flex:1 }}>
              <IIcon name="ios-reverse-camera" size={40} style={{height:40,marginTop:-8,marginRight:2}} onPress={this.reverseCamera}/>
          </View>
        )
    }
    reverseCamera(){
        if(this.state.type==='front') this.setState({type:'back'})
        else this.setState({type:'front'})
    }
    renderMore(){
        //{this.renderMoreOption('task_start','','plus')}
        return (
          <View style={{ flex:1 }}>
            <Menu name='serverMenu' onSelect={(value)=>this.chooseServer(value)}>
              <MenuTrigger onPress={this.onTriggerPress}>
                <Text style={styles.right_icon}>
                  {Object.keys(this.state.servers).length} <Icon name="caret-down" size={15}/>
                </Text>
              </MenuTrigger>
              <MenuOptions>
                {Object.keys(this.state.servers).map((k,i)=>{
                    //let name = this.state.servers[k].name
                    return this.renderMoreOption('task_join',k,'play')
                })}
              </MenuOptions>
            </Menu>
          </View>
        )
    }
    renderMoreOption(act,value,icon){
        //style={{backgroundColor:'white'}}
        let title=I18n.t(act)+' '+this.state.servers[value].name
        return (
            <MenuOption value={value} key={value} style={{padding:1}}>
                <View style={{flexDirection:'row',height:40,backgroundColor:'#494949'}}>
                    <View style={{width:30,justifyContent:'center'}}>
                        <Icon name={icon} color={'white'} size={16} style={{marginLeft:10}}/>
                    </View>
                    <View style={{justifyContent:'center'}}>
                        <Text style={{color:'white'}}>{title}</Text>
                    </View>
                </View>
            </MenuOption>
        )
    }
    _renderCircle() {
        let animate = 'rotate' //this.state.listening?'rotate':null
        return (
            <View style={styles.home_circle}>
                <Animatable.Image
                    animation={animate} //pulse,rotate,bounce,flash,rubberBand,shake,swing,tada,wobble,zoomIn,zoomOut
                    duration={3000}
                    easing="linear"
                    iterationCount="infinite"
                    style={styles.home_circle}
                    //source={require('./img/radar0.png')}
                />
            </View>
        );
    }
    takePicture() {
      this.camera.capture().then((data) => {
           //console.log('image path:'+data.path)
           Actions.result({file:data.path})
       }).catch(err => console.error(err));
    }
    render(){
        //<View style={styles.content} >
        return (
           <Camera
              ref={(cam) => {
                this.camera = cam;
              }}
              style={styles.preview}
              type={this.state.type}
              aspect={'fit'}  //fill
              captureTarget={Camera.constants.CaptureTarget.disk}
              //captureQuality={Camera.constants.CaptureQuality.medium} //1080p
           >
              <Icon
                  style={{
                      backgroundColor:'transparent',
                      margin:20,
                  }}
                  name={'camera'}
                  size={60} 
                  color={'white'} 
                  onPress={this.takePicture.bind(this)}
              />
           </Camera>
        );
    }
}
