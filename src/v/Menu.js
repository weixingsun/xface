import React from 'react';
import {Alert, Platform, View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {Actions} from "react-native-router-flux";
//import {DocumentPickerUtil,DocumentPicker} from "react-native-document-picker";
//const DocumentPicker = require('react-native').NativeModules.RNDocumentPicker;
import Icon from 'react-native-vector-icons/FontAwesome';
var Mailer = require('NativeModules').RNMail;
import I18n from 'react-native-i18n';
import styles from '../style'

const contextTypes = {
    drawer: React.PropTypes.object,
};
const MailSender = ()=>{
    Mailer.mail({
        subject: 'Query about Xconn app',
        recipients: ['sun.app.service@gmail.com'],
        //ccRecipients: ['supportCC@example.com'],
        //bccRecipients: ['supportBCC@example.com'],
        body: '',
        //isHTML: true, // iOS only, exclude if false
        //attachment: {
        //  path: '',  // The absolute path of the file from which to read data.
        //  type: '',   // Mime Type: jpg, png, doc, ppt, html, pdf
        //  name: '',   // Optional: Custom filename for attachment
        //}
    }, (error, event) => {
        if(error) {
            alert('Could not open mailbox. Please send manually to sun.app.service@gmail.com ');
        }
    });
}
const DoubleConfirmDialog = (title,content,func)=>{
	Alert.alert(
		title,   //I18n.t("feedback"),
		content, //I18n.t("confirm_feedback"),
		[
			{text:I18n.t("no"), },
			{text:I18n.t('yes'), onPress:()=>{
				//Linking.openURL('mailto:sun.app.service@gmail.com')
				func()
			}},
		]
	);
}
const renderOneMenu = (drawer,icon,name,func)=>{
    return(
        <TouchableOpacity
            style={styles.menu0}
            onPress={() => { drawer.close(); if(typeof func==='function'){ func() }else{alert(JSON.stringify(Actions))} } }>
            <View style={styles.menu_link}>
                <View style={{width:24,justifyContent:"center",}}>
                    <Icon name={icon} size={20} color={'white'} />
                </View>
                <Text style={styles.menu_name}>{name}</Text>
                <View style={{flex:1}}/>
            </View>
        </TouchableOpacity>
        )
}
const Menu = (props, context) => {
    const drawer = context.drawer;
    //{renderOneMenu(drawer,'camera',I18n.t("camera"),Actions.camera)}
    //{renderOneMenu(drawer,'picture-o',I18n.t("photos"),()=>Actions.results({dir:'photo'}))}
    return (
        <View style={styles.menu_container}>
            <View style={styles.menu_title}>
				<Text style={styles.menu_name}>{I18n.t('menu')}</Text>
            </View>
            {renderOneMenu(drawer,'home',I18n.t("home"),Actions.home)}
            {renderOneMenu(drawer,'cog',I18n.t("settings"),Actions.settings)}
            {renderOneMenu(drawer,'envelope',I18n.t('feedback'),()=>DoubleConfirmDialog(I18n.t("feedback"),I18n.t("confirm_feedback"),MailSender))}
            {renderOneMenu(drawer,'info-circle',I18n.t("about"),Actions.about)}
        </View>
    )
}
Menu.contextTypes = contextTypes;
export default Menu;

