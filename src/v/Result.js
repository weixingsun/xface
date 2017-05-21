import React from 'react';
import {AsyncStorage, Dimensions, Image, ListView, Platform, StyleSheet, Text, TouchableHighlight, View, } from "react-native";
import {Actions} from "react-native-router-flux";
import RNFS from 'react-native-fs';
import IIcon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
//import { Col, Row, Grid } from "react-native-easy-grid";
import I18n from 'react-native-i18n';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import styles from '../style'
//import OCV from 'react-native-opencv';
import Caffe from 'react-native-caffe';

export default class Result extends React.Component {
    constructor(props) {
        super(props);
        //this.ds= new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={
            img:this.props.file,
        }
        //this.shareResult=this.shareResult.bind(this)
        this.renderMore=this.renderMore.bind(this)
        this.renderMoreOption=this.renderMoreOption.bind(this)
    }
    componentWillMount(){
        //this.exist(this.props.file)
        //RNFS.readDir(RNFS.MainBundlePath+'/models/').then((result)=>{
            // '/models/'
            //alert(JSON.stringify(result))
        //})
        //this.setupNSFW()
        //let image  = RNFS.MainBundlePath+'/models/pics/front1.jpg'
        this.checkNSFWImage(this.props.file);
    }
    checkNSFWImage(image){
        Caffe.seeImage(image).then((results)=>{
            if( this.safeOrNot(results) ) alert('safe photo')
            else alert('porn photo')
        })
    }
    safeOrNot(results){
        var safe = true;
        Object.keys(results).map((item)=>{
            if(results[item]>0.6 && item==='porn') safe=false
        })
        return safe;
    }
    exist(path){
        //RNFS.exists(path).then((result) => {
            //this.updateTitle()
            //this.getFaceData()
            this.getCardImage(this.props.file)
        //}).catch((err)=>{
        //    alert('err '+JSON.stringify(err))
        //})
    }
    getFaceImage(fileName){
        let file = this.getFileInfo(fileName)
        let fileOut= file.dir+'/'+file.noext+'-face.jpg'
        OCV.faceImage(fileName,fileOut).then((img)=>{
            //this.getCardImage(fileOut)
            this.setState({
                img
            })
        }).catch((err) => {
            alert('getFaceImage error: '+err);
        });
    }
    getCardImage(fileName){
        let file=this.getFileInfo(fileName)
        let fileOut= file.dir+'/'+file.noext+'-card.jpg'
        OCV.cardImage(fileName,fileOut).then((img)=>{
            this.getFaceImage(fileOut)
        }).catch((err) => {
            alert('getCardImage error: '+err);
        });
    }
    getFaceData(){
        OCV.faceDataInImage(this.props.file).then((face)=>{
            //alert('face detected: '+JSON.stringify(face))
        }).catch((err) => {
            alert(err);
        });
    }
    getFileInfo(filePath){
        //filename.replace('%3A',':').replace('%2F','/')
        let lastIdx = filePath.lastIndexOf('/')
        let file = filePath.substr(lastIdx+1)
        let folder = filePath.substr(0,lastIdx)
        let dotIdx = file.lastIndexOf('.')
        let fileNoExt = file.substr(0,dotIdx)
        let ext = file.substr(dotIdx+1)
        return{
            dir:folder,
            name:file,
            ext:ext,
            noext:fileNoExt,
            full:filePath,
        }
    }
    //shareResult(){
    //    alert(this.result_file)
    //}
    updateTitle(){
        Actions.refresh({
            title:'Result '+this.props.file,
            //renderRightButton: ()=> <IIcon name={'ios-share-outline'} size={26} color={'#333'} onPress={ this.shareResult } />,
            renderRightButton: this.renderMore,
        });
    }
    chooseShare(value){
        if(value==='email') this.mailer()
    }
    mailer(){
        Mailer.mail({
          subject: 'Xrows result of '+this.props.sql+'.csv',
          recipients: [],
          //ccRecipients: ['supportCC@example.com'],
          //bccRecipients: ['supportBCC@example.com'],
          body: '',
          //isHTML: true, // iOS only, exclude if false
          attachment: {
            path: this.result_file,  // The absolute path of the file from which to read data.
            type: 'csv',   // Mime Type: jpg, png, doc, ppt, html, pdf
          //  name: '',   // Optional: Custom filename for attachment
          }
        }, (error, event) => {
          if(error) {
            alert('Could not open mailbox. '+JSON.stringify(error));
          }
        });
    }
    renderMore(){
        let self = this
        return (
          <View style={{ flex:1 }}>
            <Menu onSelect={(value) => this.chooseShare(value) }>
              <MenuTrigger>
                <Icon name={'ellipsis-v'} size={23} style={styles.right_icon} />
              </MenuTrigger>
              <MenuOptions>
                  {self.renderMoreOption('email','envelope')}
              </MenuOptions>
            </Menu>
          </View>
        )
    }
    renderMoreOption(value,icon){
        //style={{backgroundColor:'white'}}
        return (
            <MenuOption value={value} key={value} style={{padding:1}}>
                <View style={{flexDirection:'row',height:40,backgroundColor:'#494949'}}>
                    <View style={{width:40,justifyContent:'center'}}>
                        <Icon name={icon} color={'white'} size={16} style={{marginLeft:10}}/>
                    </View>
                    <View style={{justifyContent:'center'}}>
                        <Text style={{color:'white'}}>{I18n.t('via')+' '+I18n.t(value)+I18n.t('share')}</Text>
                    </View>
                </View>
            </MenuOption>
        )
    }
    _renderRowView(rowData) {
        if(rowData==null) return
        //alert('rowData='+JSON.stringify(rowData))
        return (
            <View style={styles.row}>
                <Grid >
                    {Object.keys(rowData).map((key,i)=>{
                        return <Col key={i} style={styles.cell}><Text style={styles.value_text}>{rowData[key]}</Text></Col>
                    })}
                </Grid>
                <View style={styles.separator} />
            </View>
        );
    }
    _renderTitleRowView(rowData) {
        if(rowData==null) return
        return (
            <View style={styles.header}>
                <Grid >
                    {Object.keys(rowData).map((key,i)=>{
                        return <Col key={i} style={styles.cell}><Text style={styles.header_text}>{key}</Text></Col>
                    })}
                </Grid>
                <View style={styles.separator} />
            </View>
        );
    }
    renderImage(){
        let imgUri = this.state.img===null?require('./img/ximage.png'):{uri:this.state.img}
        if(this.state.img!==null)
        return (
            <Image source={imgUri} style={styles.full_abs} />
        )
    }
    render(){
        return (
        <View style={styles.content}>
            {this.renderImage()}
        </View>
        );
    }
}
