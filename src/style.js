//import React from 'react';
import {Platform} from "react-native";

module.exports = {
    menu_container: {
        flex: 1,
        backgroundColor: "#2a2929",
    },
    container: {
        flex: 1,
        //justifyContent: "center",
        //alignItems: "center",
        backgroundColor: "#F5FCFF",
        //marginTop:Platform.OS==='android'?54:64,
    },
    full_abs:{
        position: 'absolute',
        top:0,
        left: 0,
        bottom: 0,
        right: 0,
        resizeMode: "stretch",
    },
    content:{
        flex: 1,
        marginTop:Platform.select({
                ios: 64,
                android: 54,
        }),
        alignItems:'center',
        justifyContent:'center',
    },
    web:{
        flex: 1,
        backgroundColor: "#F5FCFF",
        marginTop:Platform.select({
                ios: 64,
                android: 54,
        }),
    },
    listContainer: {
        flex: 1,
        //flexDirection: 'column',
    },
    home_circle:{
        width:200,
        height:200,
        alignItems:'center',
        justifyContent:'center',
    },
    button_idle:{
        borderColor:'#16a085',
        backgroundColor:'#1abc9c',
        margin:20
    },
    button_running:{
        borderColor:'#c0392b',
        backgroundColor:'#e74c3c',
        margin:20
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC',
    },
    header:{
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.5,
        borderBottomWidth:0,
        borderRightWidth:0,
        height:40,
    },
    header_text:{
        fontWeight:'bold',
        fontSize:10,
    },
    value_text:{
        fontSize:10,
    },
    row:{
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.5,
        borderBottomWidth:0,
        borderTopWidth:0,
        borderRightWidth:0,
        height:40,
        backgroundColor:'white',
    },
    cell:{
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.5,
        borderTopWidth:0,
        borderLeftWidth:0,
        backgroundColor:'white',
    },
    right_icon:{
        paddingTop:4,
        //paddingBottom:5,
        paddingLeft:15,
        //paddingRight:10,
        width: 50,
        height: 24,
        //borderColor: '#8e44ad',
        //backgroundColor: 'blue',
        borderRadius: 0,
        borderWidth: 2,
        //alignItems:'center',
        //justifyContent:'center',
    },
    bk:{
        marginLeft:5,
        marginRight:40,
        //alignItems:'center',
        //marginTop:5,
        //marginBottom:5,
    },
    act:{
        marginLeft:40,
        marginRight:10,
        //alignItems:'center',
        //marginTop:5,
        //marginBottom:5,
    },
    section:{
        flex: 1,
        justifyContent: 'center',
        //alignItems: 'center',
        //borderWidth: 1,
        //backgroundColor: '#fff',
        //borderColor: 'rgba(0,0,0,0.1)',
        //marginTop: 5,
        //shadowColor: '#ccc',
        //shadowOffset: { width: 2, height: 2, },
        //shadowOpacity: 0.5,
        //shadowRadius: 3,
        //flexDirection:'row',
        //padding: 15,
        //paddingTop:5,
        //paddingBottom:5,
    },
    title:{
        fontWeight:'bold',
        fontSize:20,
        backgroundColor:'#eeeeee',
    },
  menu_title: {
    justifyContent: "center",
    //alignItems: "flex-start",
    backgroundColor: "#2a2929",
        //padding:20,
        ...Platform.select({
      ios: {
        height: 64,
      },
      android: {
        height: 54,
      },
    }),
  },
  menu0: {
    justifyContent: "center",
    //alignItems: "flex-start",
    backgroundColor: "#494949",
    height:48,
    paddingLeft:6,
    marginTop:1,
  },
  menu_name: {
    marginLeft:10,
    fontSize:14,
    color:'white',
  },
  menu_link:{
    marginLeft:10,
    flexDirection:'row',
    justifyContent:'center',
  },
  detail_card: {
    justifyContent: 'center',
    //alignItems: 'center',
    height:50,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#ccc',
    //shadowOffset: { width: 2, height: 2, },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    //flexDirection:'row',
    padding: 5,
    //paddingTop:5,
    //paddingBottom:5,
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    //margin:10,
  },
  imageGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    //margin: 10,
  },
  btn: {
    margin: 10,
    backgroundColor: "#3B5998",
    color: "white",
    padding: 10
  },

  btnModal: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    backgroundColor: "transparent"
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height:300,
  },
  slider_track: {
    //height: 10,
    //borderRadius: 5,
    backgroundColor: '#d0d0d0',
  },
  slider_thumb: {
    //width: 10,
    //height: 30,
    //borderRadius: 5,
    backgroundColor: '#eb6e1b',
    //top: 19,
  },
}
