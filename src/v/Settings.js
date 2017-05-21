import React from 'react';
import {Alert,AsyncStorage,Clipboard,Image,ListView, Modal, View, Text, StyleSheet, ScrollView, TouchableHighlight,TouchableOpacity,NativeModules,Linking} from "react-native";
import {Actions} from "react-native-router-flux"
import RNFS from 'react-native-fs'
import I18n from 'react-native-i18n'
import DeviceInfo from 'react-native-device-info'
import styles from '../style'
//import NetworkInfo from 'react-native-network-info'
import Icon from 'react-native-vector-icons/FontAwesome'
import Slider from 'react-native-slider'
import Button from 'apsl-react-native-button'

export default class About extends React.Component {
    constructor(props) {
        super(props);
        this.state={ 
            modalVisible:false,
            nsfw:0.3,
        }
        this.copy=this.copy.bind(this)
    }
    componentWillMount() {
    }
    setModalVisible(visible) {
        this.setState({modalVisible: visible}); 
    }
    renderModalIPs(){
        let keys = Object.keys(this.state.ips)
        keys.sort()
        return (
        <Modal 
            animationType={"slide"} 
            transparent={false} 
            visible={this.state.modalVisible} 
            //onRequestClose={() => {alert("Modal has been closed.")}} 
        > 
            <View style={{flex:1}}>
                <Icon 
                    name={'times-circle'} 
                    size={30} 
                    onPress={()=>{this.setModalVisible(!this.state.modalVisible)}}
                    style={{marginTop:16,marginLeft:5}}
                />
                <View
                  style={{
                    flex:1,
                    margin:10,
                    //alignItems:'center',
                    justifyContent:'center',
                  }}
                >
                  {keys.map(k=>{
                    let addr = this.state.ips[k].addr
                    return (
                      <View style={{flexDirection:'row',}} key={k} onPress={()=>this.copy(addr)}>
                        <Text style={{fontSize:12,width:60}}>{k.split('/')[0]}</Text>
                        <View>
                          <Text style={{fontSize:12}}>{addr}</Text>
                          <Text style={{fontSize:12}}>{this.state.ips[k].mask}</Text>
                          <Text/>
                        </View>
                      </View>
                    )
                  })}
                </View> 
            </View> 
        </Modal>
        )
    }
    copy(value){
        //Toast.show(I18n.t('copy')+' '+I18n.t('ip')+': '+value)
        Clipboard.setString(value)
    }
    renderButton(title,btn_title,func){
        return(
            <View style={styles.detail_card}>
                <View style={{height:30,flexDirection:'row',justifyContent:'center'}}>
                    <Text style={{width:100,color:'black',fontSize:16,margin:5}}> {title}: </Text>
                    <View style={{flex:1}}/>
                    <Button style={{height:30,width:100,marginRight:20}} textStyle={{fontSize:16}} onPress={func}>{btn_title}</Button>
                </View>
            </View>
        )
    }
    renderSlide(title,btn_title,func){
        return(
            <View style={styles.detail_card}>
                <View style={{height:30,flexDirection:'row',justifyContent:'center'}}>
                    <Text style={{width:100,color:'black',fontSize:16,margin:5}}> {title}: </Text>
                    <View style={{flex:1}}>
                        <Slider 
			    //style={{height:40}} 
			    //minimumValue={0.1}
			    //minimumValue={0.9}
                            trackStyle={styles.slider_track}
                            thumbStyle={styles.slider_thumb}
                            //minimumTrackTintColor='#1073ff'
                            //maximumTrackTintColor='#b7b7b7'
			    step={0.1} 
                            value={this.state.nsfw} 
			    onValueChange={this.changeNSFW.bind(this)}/>
                    </View>
                </View>
            </View>
        )
    }
    changeNSFW(value){
        if(value>0.9 || value<0.1){
	    //alert('NSFW value need between 0 ~ 1')
	    this.setState({nsfw:this.state.nsfw})
        }else{
	    this.setState({nsfw:value})
	}
    }
    clearAS(){
        Alert.alert(
            I18n.t("reset"),
            I18n.t("confirm_reset_history"),
            [
              {text:I18n.t("no"), },
              {text:I18n.t('yes'), onPress:()=>{
                  //Linking.openURL('mailto:sun.app.service@gmail.com')
                  AsyncStorage.clear(()=>{})
              }},
            ]
        );
    }
    renderIcon(){
        return (
            <View style={{flex:1,height:200,justifyContent: 'center',alignItems:'center'}}>
                <Text style={{justifyContent:'center'}} > </Text>
                <Text style={{justifyContent:'center'}} > </Text>
                <Image 
                    style={{width: 100, height: 100, backgroundColor:'white'}}
                    source={require('./img/ximage.png')}
                />
                <Text style={{justifyContent:'center'}} >{I18n.t('ximage')} {DeviceInfo.getVersion()}</Text>
                <Text style={{justifyContent:'center'}} > </Text>
                <Text style={{justifyContent:'center'}} > </Text>
            </View>
        )
    }
    renderCopyright(){
        let date = new Date()
        return (
            <View style={{flex:1,height:200,justifyContent: 'center',alignItems:'center'}}>
                <Text style={{justifyContent:'center'}} > </Text>
                <Text style={{justifyContent:'center'}} > </Text>
                <Text style={{justifyContent:'center'}} >Copyright @{date.getFullYear()+' '+I18n.t('ximage')}</Text>
                <Text style={{justifyContent:'center'}} > </Text>
            </View>
        )
    }
    render(){
        //{this.renderModalIPs()}
        return (
            <View style={styles.container}>
                {this.renderIcon()}
                {this.renderButton(I18n.t('history'), I18n.t('reset'),  this.clearAS)}
                {this.renderSlide(I18n.t('NSFW'),    I18n.t('config'), ()=>{alert('change ratio from 0.1~0.9')})}
                {this.renderCopyright()}
            </View>
        );
    }
}
