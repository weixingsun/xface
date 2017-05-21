import React from 'react';
import {Alert, AsyncStorage,CameraRoll,Dimensions, Image, ListView, Platform, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, } from "react-native";
import {Actions} from "react-native-router-flux";
import Icon from 'react-native-vector-icons/FontAwesome';
import IIcon from 'react-native-vector-icons/Ionicons';
import I18n from 'react-native-i18n';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import styles from '../style'
import Pie from './Pie'
import Global from '../Global'
import * as Animatable from 'react-native-animatable'
import Button from 'apsl-react-native-button'
import Camera from 'react-native-camera'
import RNFS from 'react-native-fs';
import Caffe from 'react-native-caffe';

let PHOTOS_COUNT_BY_FETCH = 100
let PHOTOS_COUNT_ERROR = 3
export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.ds= new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={ 
            scanning:false,
            dirs:{
                tmp:{name:'Temp',path:RNFS.TemporaryDirectoryPath},
                bundle:{name:'Bundle',path:RNFS.MainBundlePath},
                doc:{name:'Docs',path:RNFS.DocumentDirectoryPath},
                camera:{name:'Camera',path:'camera'},
                photo:{name:'Photo',path:'photo'},
            },
            all_images:{},  //{image1.jpg:{porn:0.35,face:0}, image2.jpg:{porn:0.01,face:2}}
            porn_images:[], //[image1.jpg,image2.jpg]
            face_images:[], //[image3.jpg]
            saw_total:0,
            copy_total:0,
            data:{
                all:0,
                porn:0,
                face:0,
            },
        }
        this.renderLevel=this.renderLevel.bind(this)
        this.lastPhotoFetched = undefined; // null would crash on iOS.
        this.lastScanID = 'LAST_SCAN_PHOTO'
        this.lastFacesID = 'FACES_PHOTO'
        this.lastPornsID = 'PORNS_PHOTO'
        this.lastAllID = 'ALL_PHOTO'
    }
    componentWillMount() {
        //this.clearAS()
        this.updateWithActionIcon()
        this.setupNSFW()
        this.getLastScan()
        this.getLastFaces()
        this.getLastPorns()
        this.getLastAll()
    }
    componentWillReceiveProps(props){
        if(props.reset) {
            this.clearAS()
        }
    }
    componentWillUnmount(){
        //this.stopAll()
        this.updateUI=false
    }
    clearAS(){
        AsyncStorage.clear(()=>{})
        this.setState({
            all_images:{},  //{image1.jpg:{porn:0.35,face:0}, image2.jpg:{porn:0.01,face:2}}
            porn_images:[], //[image1.jpg,image2.jpg]
            face_images:[], //[image3.jpg]
            saw_total:0,
            copy_total:0,
            data:{
                all:0,
                porn:0,
                face:0,
            }
        })
    }
    setPieData(){
        let all  = Object.keys(this.state.all_images).length
        let face = this.state.face_images.length
        let porn = this.state.porn_images.length
        let copy_total = all
        let saw_total = all
        //alert('all='+all+' face='+face+' porn='+porn)
        if(all>0 && face>0 && porn>0){
            this.setState({saw_total,copy_total,data:{all,porn,face}})
        }
    }
    setLastScan(value){
        AsyncStorage.setItem(this.lastScanID, value)
    }
    setLastAll(value){
        AsyncStorage.setItem(this.lastAllID, JSON.stringify(value))
    }
    setLastFaces(value){
        AsyncStorage.setItem(this.lastFacesID, JSON.stringify(value))
    }
    setLastPorns(value){
        AsyncStorage.setItem(this.lastPornsID, JSON.stringify(value))
    }
    getLastScan(){
        AsyncStorage.getItem(this.lastScanID, (err, result) => {
            if(result){
                this.lastPhotoFetched = result
                //alert('last_scan='+result)
            }
        });
    }
    getLastAll(){
        AsyncStorage.getItem(this.lastAllID, (err, result) => {
            if(result){
                let all_images = JSON.parse(result)
                this.setState({ all_images })
                this.setPieData()
            }
        });
    }
    getLastFaces(){
        AsyncStorage.getItem(this.lastFacesID, (err, result) => {
            if(result){
                this.setState({ face_images:JSON.parse(result) })
                this.setPieData()
            }
        });
    }
    getLastPorns(){
        AsyncStorage.getItem(this.lastPornsID, (err, result) => {
            if(result){
                this.setState({ porn_images:JSON.parse(result) })
                this.setPieData()
            }
        });
    }
    getPhotosFromCameraRollData(data) {
        return data.edges.map((asset) => {
            return asset.node.image;
        });
    }
    onPhotosFetchedSuccess(data) {
        const newPhotos = this.getPhotosFromCameraRollData(data);
        let copy_total = this.state.copy_total+ newPhotos.length
        var data = this.state.data
        data['all']=copy_total
        this.setState({
            copy_total,
            data
        });
        if (newPhotos.length){
           this.lastPhotoFetched = newPhotos[newPhotos.length - 1].uri;
           console.log(newPhotos.length+' last='+this.lastPhotoFetched)
           this.setLastScan(this.lastPhotoFetched)
        }
        this.storeImages(newPhotos,(item)=>{
            this.seeOneImage(item)
        })
        console.log("onPhotosFetchedSuccess()")
    }
    fetchPhotos(first = PHOTOS_COUNT_BY_FETCH, after = this.lastPhotoFetched) {
        //console.log('fetchPhotos ('+PHOTOS_COUNT_BY_FETCH+','+after+')')
        let options = {
            first,
            after,
        }
        CameraRoll.getPhotos(options).then((data) => {
            this.onPhotosFetchedSuccess(data)
        }).catch((e) => {
            alert('error: '+JSON.stringify(e));
        });
        this.setState({scanning:true})
    }
    onEndReached() {
        //alert('onEndReached '+this.lastPhotoFetched)
        this.fetchPhotos(PHOTOS_COUNT_BY_FETCH, this.lastPhotoFetched);
    }
    nextFetch(){
        let all_keys = Object.keys(this.state.all_images)
        if(all_keys.length===this.state.copy_total ){
            RNFS.readDir(RNFS.TemporaryDirectoryPath).then((files)=>{
                //alert(JSON.stringify(files))
                files.map((item)=>{
                    RNFS.unlink(item.path).catch((err)=>{console.log('err rm: '+item.path)})
                })
                this.onEndReached()
                /*if(this.state.saw_total<PHOTOS_COUNT_BY_FETCH-PHOTOS_COUNT_ERROR){
                    this.onEndReached()
                }else{
                    this.setState({scanning:false})
                }*/
            }).catch((err)=>{
                console.log('nextFetch'+err.message)
            })
        }else{
            //console.log(image.path)
        }
    }
    storeImages(asset_images, success) {
        //const asset_images = this.getPhotosFromCameraRollData(data) //data.edges.map( asset => asset.node.image );
        asset_images.map((asset)=>{
            let opt = {
                asset: asset.uri,  //"asset-library://",
                filename: asset.filename, //img_2222.jpg
                path: RNFS.TemporaryDirectoryPath,//tmp,doc,bundle,,,,
                sync: 'true',  //'true',
            }
            let uri = asset.uri
            let error = (err)=>{
                console.log('storeImage error: ', err);
            }
            let path = RNFS.TemporaryDirectoryPath+asset.filename
            let name = asset.filename
            let img = {path,uri,name}
            RNFS.saveImage(opt,()=>success(img),error)
            //return img
            //let path = RNFS.TemporaryDirectoryPath+'/'+asset.filename
            //arr.push(path)
        })
        //console.log('copied images:',asset_images)
    }
    countPorn(options, image){
        let porn = options==null?false:options.porn
        let porn_images = this.state.porn_images
        let all_images = this.state.all_images
        var json = all_images[image.name]
        if(typeof json==='object') json['porn'] = options.porn
        else if(typeof json==='undefined') json = {porn:options.porn}
        json['uri'] = image.uri
        all_images[image.name] = json
        var data = this.state.data
        if(options.porn>Global['LEVEL']){
            porn_images.push(image.name)
            data['porn']=data.porn+1
        }
        this.setState({all_images,porn_images,data})
        this.setLastAll(all_images)
        this.setLastPorns(porn_images)
    }
    countFace(options, image){
        let face = options==null?false:options.face
        let face_images= this.state.face_images
        let all_images = this.state.all_images
        var json = all_images[image.name]
        if(typeof json==='object') json['face'] = options.face
        else if(typeof json==='undefined') json = {face:options.face}
        json['uri'] = image.uri
        all_images[image.name] = json
        var data = this.state.data
        if(options.face>0){
            face_images.push(image.name)
            data['face']=data.face+1
        }
        this.setState({all_images,face_images,data})
        this.setLastAll(all_images)
        this.setLastFaces(face_images)
    }
    afterSaw(image,success){
        //let image = opts.image
        //let porn_images = opts.porn_images?opts.porn_images:this.state.porn_images
        //let face_images = opts.face_images?opts.face_images:this.state.face_images
        //alert(JSON.stringify(opts)) //{name,uri,path}
        let json = this.state.all_images[image.name]
        //alert('saw '+this.state.saw_total+'json.porn='+json.porn+'json.face='+json.face+'\n'+JSON.stringify(json)) //this.state.all_images
        let p = json.porn>0
        let f = json.face>-2
        if(p && f){
          //alert(' p ---> '+p+'\n f ---> '+f)
          this.setState({saw_total:this.state.saw_total+1})
          this.nextFetch()
        }
    }
    //updateState(state){
    //    this.setState( state )
    //}
    seeOneImage(img){
        RNFS.exists(img.path).then((result) => {
            if(result){
                this.checkFaceImage(img)
                this.checkNSFWImage(img)
            }else{
                console.log('non-exist :'+img.path)
            }
        }).catch((err)=>{
            console.log('RNFS.exists error:',err)
        })
    }
    checkNSFWImage(image){
       let ext = image.path.substr(image.path.lastIndexOf('.') + 1).toLowerCase();
       if(ext==='jpg' || ext==='png'){
          Caffe.seeImage(image.path).then((results)=>{
            this.countPorn({porn:results.porn},image)
            this.afterSaw(image,true)
          }).catch((err)=>{
            console.log('Caffe.seeImage err: ',err)
          })
       }else{
          this.afterSaw(image,false)
          console.log('not image: '+image)
       }
    }
    checkFaceImage(image){
       let ext = image.path.substr(image.path.lastIndexOf('.') + 1).toLowerCase();
       if(ext==='jpg' || ext==='png'){
          Caffe.faceDetect(image.path).then((results)=>{
            let face = results==null?-1:results.count
            this.countFace({face},image)
            this.afterSaw(image,true)
          }).catch((err)=>{
            console.log('Caffe.seeImage err: ',err)
          })
       }else{
          this.afterSaw(image,false)
          console.log('not image: '+image)
       }
    }
    setupNSFW(){
        let _model  = RNFS.MainBundlePath+'/models/nsfw.prototxt'
        let _weight = RNFS.MainBundlePath+'/models/nsfw.caffemodel'
        let _mean   = RNFS.MainBundlePath+'/models/nsfw.binaryproto'
        let _label  = RNFS.MainBundlePath+'/models/nsfw.labels'
        Caffe.setup4(_model,_weight,_mean,_label).then((result)=>{
        //Caffe.setup3(_model,_weight,_mean).then((result)=>{
        //Caffe.setup2(_model,_weight).then((result)=>{
            //alert('setup done: '+JSON.stringify(result))
        })
    }
    updateWithActionIcon(){
        Actions.refresh({
            key:'home',
            renderRightButton: this.renderLevel,
        });
    }
    renderLevel(){
        let title=Global['LEVEL']  //'Level:'+
        return (
            <Text style={styles.right_icon}>{title}</Text>
        )
    }
    scanDir(name){
        let path = this.state.dirs[name].path
        /*if(name==='tmp'){
            RNFS.readDir(path).then((files)=>{
                //alert(JSON.stringify(files))
                files.map((item)=>{
                    RNFS.unlink(item.path)
                })
            })
        }*/
        if(name==='bundle') path+='/pics/'
        if(path=='camera'){
            Actions.camera()
        }else if(path=='photo'){
            Actions.results({dir:path})
        }else{
            Actions.results({dir:path})
        }
    }
    renderMore(){
        //{this.renderMoreOption('task_start','','plus')}
        return (
          <View style={{ flex:1 }}>
            <Menu name='serverMenu' onSelect={(value)=>this.scanDir(value)}>
              <MenuTrigger onPress={this.onTriggerPress}>
                <Text style={styles.right_icon}>
                  {Object.keys(this.state.dirs).length} <Icon name="caret-down" size={15}/>
                </Text>
              </MenuTrigger>
              <MenuOptions>
                {Object.keys(this.state.dirs).map((k,i)=>{
                    return this.renderMoreOption('scan',k,'play')
                })}
              </MenuOptions>
            </Menu>
          </View>
        )
    }
    renderMoreOption(act,value,icon){
        //style={{backgroundColor:'white'}}
        let title=I18n.t(act)+' '+this.state.dirs[value].name
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
    _renderCounter(){
        let pornCount = this.state.porn_images.length
        let faceCount = this.state.face_images.length
        //let sawCount  = this.state.saw_total
        //let copyCount  = this.state.copy_total
        let allCount  = Object.keys(this.state.all_images).length
        return (
            <Text>{ pornCount + ' / ' +faceCount+ ' / '+allCount } </Text>
        )
    }
    _renderButton(color,title,onPress){
        return (
            <Button
                style={{height:40,width:300,backgroundColor:color}}
                textStyle={{fontSize:16}}
                onPress={onPress}
            ><Text>{ title }</Text></Button>
        )
    }
    _renderScanButton(){
        let scan_title=''
        //let onFacePress=()=>{alert(JSON.stringify(faces))}
        let onScanPress=()=>this.fetchPhotos()
        if(this.state.scanning) {
            scan_title='Stop Scanning'
            onScanPress=()=>this.setState({scanning:false})
            //let pornCount = this.state.porn_images.length
            //let faceCount = this.state.face_images.length
            //let sawCount  = this.state.saw_total
            //let copyCount  = this.state.copy_total
            //let allCount  = Object.keys(this.state.all_images).length
            //let msg = pornCount+'/'+faceCount+'/'+allCount+'\ndata='+JSON.stringify(this.state.data)+'\nlastScan='+this.lastPhotoFetched
        }else{
            scan_title='Scan Photos'
            onScanPress=()=>this.fetchPhotos()
        }
        return this._renderButton('white',scan_title,onScanPress)
    }
    _renderFaceButton(){
        var faces = []
        this.state.face_images.map((img)=>{faces.push(this.state.all_images[img])})
        let face_title='images with face'
        //let onFacePress=()=>{alert(JSON.stringify(faces))}
        let onFacePress=()=>Actions.images({images:faces, t:'face'})
        if(this.state.face_images.length>0)
            return this._renderButton('#66A066',face_title,onFacePress)
    }
    _renderPornButton(){
        let porns = []
        this.state.porn_images.map((img)=>{porns.push(this.state.all_images[img])})
        let porn_title='images with adult'
        let onPornPress=()=>Actions.images({images:porns, t:'porn'})
        if(this.state.porn_images.length>0)
            return this._renderButton('#A06666',porn_title,onPornPress)
    }
    _renderButtons(){
        let style = {margin:20}
        return (
            <View style={style}>
                { this._renderScanButton() }
                { this._renderFaceButton() }
                { this._renderPornButton() }
            </View>
        )
    }
    _renderCircle() {
        //let animate = 'rotate' //this.state.listening?'rotate':null
        let animate = this.state.scanning?'rotate':null
        return (
            <TouchableOpacity
             style={styles.home_circle} 
             onPress={()=>{alert(JSON.stringify(this.state.porn_images))}}>
                <Animatable.Image
                    animation={animate} //pulse,rotate,bounce,flash,rubberBand,shake,swing,tada,wobble,zoomIn,zoomOut
                    duration={3000}
                    easing="linear"
                    iterationCount="infinite"
                    style={styles.home_circle}
                    //source={require('./img/radar0.png')}
                    onPress={()=>{alert(JSON.stringify(this.state.porn_images))}}
                />
            </TouchableOpacity>
        );
    }
    _renderPie(){
        return (
            <Pie data={this.state.data} />
        )
    }
    render(){
        return (
           <View style={styles.content} >
               {this._renderCounter()}
               {this._renderPie()}
               {this._renderButtons()}
           </View>
        );
    }
}
