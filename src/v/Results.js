import React from 'react';
import {
  AsyncStorage, 
  CameraRoll, 
  Dimensions, 
  Image, 
  ListView, 
  Platform, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableHighlight, 
  View, 
} from "react-native";
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

let PHOTOS_COUNT_BY_FETCH = 5;
export default class Results extends React.Component {
    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.images=[];
        this.state={
            dir:this.props.dir,
            saw_total:0,
            copy_total:0,
            porn_images:[],
            face_images:[],
            dataSource: this.ds.cloneWithRows([]),
        }
        this.renderMore=this.renderMore.bind(this)
        this.renderMoreOption=this.renderMoreOption.bind(this)
        this.lastPhotoFetched = undefined; // Using `null` would crash ReactNative CameraRoll on iOS.
    }
    componentWillMount(){
        this.processParam()
    }
    getDataSourceState() {
        return this.ds.cloneWithRows(this.images)
    }
    getPhotosFromCameraRollData(data) {
        return data.edges.map((asset) => {
            return asset.node.image;
        });
    }
    onPhotosFetchedSuccess(data) {
        const newPhotos = this.getPhotosFromCameraRollData(data);
        //console.log('onPhotosFetchedSuccess',data);
        //this.images = this.images.concat(newPhotos);
        this.setState({
            copy_total: this.state.saw_total+ newPhotos.length
        });
        if (newPhotos.length) this.lastPhotoFetched = newPhotos[newPhotos.length - 1].uri;
        //alert('new images:'+newPhotos.length)
        this.storeImages(newPhotos,(item)=>{
            this.seeOneImage(item)
        })
        //alert(JSON.stringify(this.images))
        /*this.images.map((item)=>{
            this.seeImage(item)
        })*/
    }

    onPhotosFetchError(err) {
        // Handle error here
        console.log(err);
    }

    fetchPhotos(count = PHOTOS_COUNT_BY_FETCH, after) {
        let options = {
            first: count,
            after,
        }
        CameraRoll.getPhotos(options).then((data) => {
            //this.storeImages(data)
            this.onPhotosFetchedSuccess(data)
        })
        /*.catch((e) => {
            alert('error: '+JSON.stringify(e));
        });*/
    }

    onEndReached() {
        this.fetchPhotos(PHOTOS_COUNT_BY_FETCH, this.lastPhotoFetched);
    }
    processParam(){
        if(this.props.dir==='photo'){
            this.fetchPhotos();
            //this.onEndReached()
        }else{
            RNFS.readDir(this.props.dir).then((files)=>{
                //alert(JSON.stringify(files))
                files.map((item)=>{
                    this.seeOneImage(item.path)
                })
            })
        }
    }
    storeImages(asset_images, success) {
        //const asset_images = this.getPhotosFromCameraRollData(data) //data.edges.map( asset => asset.node.image );
        return asset_images.map((asset)=>{
            let opt = {
                asset: asset.uri,  //"asset-library://",
                filename: asset.filename, //img_2222.jpg
                path: RNFS.TemporaryDirectoryPath,//tmp,doc,bundle,,,,
                sync: 'true',  //'true',
            }
            //let success = ()=>{
                //console.log('copied '+asset.filename)
            //}
            let error = (err)=>{
                console.log('storeImage error: ', err);
            }
            let path = RNFS.TemporaryDirectoryPath+asset.filename
            RNFS.saveImage(opt,()=>success(path),error)
            return path
            //let path = RNFS.TemporaryDirectoryPath+'/'+asset.filename
            //arr.push(path)
        })
        //console.log('copied images:',asset_images)
    }
    seeOneImage(path){
        RNFS.exists(path).then((result) => {
            //console.log(result+': '+path)
            if(result){
                //this.checkFaceImage(path)
                this.checkNSFWImage(path)
            }else{
                console.log('non-exist :'+path)
                this.afterSawPorn(null, path)
            }
        }).catch((err)=>{
            console.log('RNFS.exists error:',err)
            //workaround #1
            this.afterSawPorn(null, path)
        })
    }
    afterSawFace(options, image){

    }
    afterSawPorn(options, image){
        let porn = options==null?false:options.porn
        let saw_total = this.state.saw_total+1
        //let porn_total = porn?this.state.porn_total:this.state.porn_total+1
        let porn_images= this.state.porn_images
        if(porn) porn_images.push(image)
        //console.log('non-exist '+result+': '+path+'\nsaw_total='+saw_total+'\ncopy_total='+this.state.copy_total)
        /*let face = options==null?false:options.face
        if( face ){
            let face_images = this.state.face_images
            face_images.push(image)
            this.setState({face_images})
        }*/
        this.setState({
            saw_total,
            porn_images,
            //face_images,
        })
        if(!porn) RNFS.unlink(image).then(()=>{}).catch((err)=>{console.log(err.message)})
        if(this.state.copy_total===saw_total){
            this.onEndReached()
        }else{
            console.log('('+saw_total+'/'+this.state.copy_total+')')
        }
    }
    checkNSFWImage(image){
       let ext = image.substr(image.lastIndexOf('.') + 1).toLowerCase();
       if(ext==='jpg' || ext==='png'){
          Caffe.seeImage(image).then((results)=>{
            let porn = this.pornOrNot(results)
            //console.log('porn check:'+image,results)
            this.afterSawPorn({porn:porn},image)
          }).catch((err)=>{
            console.log('Caffe.seeImage err: ',err)
          })
       }else{
          this.afterSawPorn(null, image)
          console.log('not image: '+image)
       }
    }
    checkFaceImage(path){
        Caffe.faceData(path).then((results)=>{
            let face = results==null?false:results.count.length>0
            this.afterSawFace({face:face},image)
            console.log('Caffe.faceData: ',results)
            /*if( results.count.length>0 ){
                let face_images = this.state.face_images
                face_images.push(path)
                this.setState({face_images})
            }*/
        }).catch((err)=>{
            console.log('Caffe.faceData err: ',err)
        })
    }
    pornOrNot(results){
        //console.log('pornOrNot',results)
        //let porn = results['0'] &&results['0']>0.5
        let porn = results.porn && results.porn>0.5
        //console.log('pornOrNot: '+porn)
        return porn
    }
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
        let imgUri ={uri:this.state.dir}
        if(this.state.img!==null)
        return (
            <Image source={imgUri} style={styles.full_abs} />
        )
    }
    renderScrollView(){
        //console.log(JSON.stringify(this.state.porn_images))
        return (
          <ScrollView style={styles.container}>
            <View style={styles.imageGrid}>
            { this.state.porn_images.map(image => <Image key={image} style={styles.image} source={{ uri: image }} />) }
            </View>
          </ScrollView>
        )
    }
    render(){
        let pornCount = this.state.porn_images.length
        let faceCount = this.state.face_images.length
        let totalCount = this.state.saw_total
        return (
        <View style={styles.content}>
            <Text>{ pornCount + ' / ' +faceCount+ " / "+totalCount } </Text>
            {this.renderScrollView()}
        </View>
        );
    }
    /*render() {
    return (
      <View style={styles.content}>
        <ListView
          style={{flex:1}}
          contentContainerStyle={styles.imageGrid}
          dataSource={this.state.dataSource}
          onEndReached={this.onEndReached.bind(this)}
          onEndReachedThreshold={10}
          showsVerticalScrollIndicator={false}
          enableEmptySections={true}
          renderRow={(image) => {return (
            <View>
              <Image
                style={styles.image}
                source={{ uri: image.uri }}
              />
            </View>
          )}}
        />
      </View>
    );
    }*/
}
