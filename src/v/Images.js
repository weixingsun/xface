import React from 'react';
import {
  AsyncStorage, 
  Image, 
  ListView, 
  //Modal,
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableHighlight, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  View, 
} from "react-native";
import Button from 'react-native-button'
import {Actions} from "react-native-router-flux";
import IIcon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
//import RNFS from 'react-native-fs';
//import Gallery from 'react-native-gallery';
import TImage from 'react-native-transformable-image';
import I18n from 'react-native-i18n';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import styles from '../style'
import Modal from 'react-native-modalbox';

export default class Images extends React.Component {
    constructor(props) {
        super(props);
        this.state={isOpen:false}
        //this.renderMore=this.renderMore.bind(this)
        //this.renderMoreOption=this.renderMoreOption.bind(this)
    }
    componentWillMount(){
        //alert(JSON.stringify(this.props.images))
	this.updateTitle()
    }
    updateTitle(){
        Actions.refresh({
            title:this.props.t==='porn'?'Adult':'Face',
            //renderRightButton: this.renderMore,
        });
    }
    /*renderMore(){
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
    }*/
    renderScrollView(){
        return (
          <ScrollView style={styles.container}>
            <View style={styles.imageGrid}>
            { this.props.images.map(image => {
	        let value = image[this.props.t]
                let txt = this.props.t=='porn'?value.toFixed(3):value
                //console.log('image.'+this.props.t+'='+value)
                return <TouchableOpacity 
                  style={styles.image}
                  key={image.uri} 
                  onPress={()=>{
		      //alert(JSON.stringify(image))
                      this.setState({image,isOpen:true})
                  }}
                >
                    <Image style={styles.image} source={image} />
                    <Text fontSize={8} style={{marginLeft:10}}>{txt}</Text>
                </TouchableOpacity>
            })}
            </View>
          </ScrollView>
        )
    }
    renderModal1(){
        var BContent = <Button onPress={() => this.setState({isOpen: false})} style={[styles.btn, styles.btnModal]}>X</Button>;
        return (
        <Modal
            isOpen={this.state.isOpen} 
            onClosed={() => this.setState({isOpen: false})} 
            style={[styles.modal]} 
            position={"center"} 
            backdropContent={BContent}>
            <TImage style={{width:200,height:200}} source={this.state.image} />
        </Modal>
        )
    }
    render(){
        return (
        <View style={styles.content}>
            {this.renderScrollView()}
            {this.renderModal1()}
        </View>
        );
    }
}
