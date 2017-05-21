import React from 'react';
import {Alert, AsyncStorage,CameraRoll,Dimensions, Image, ListView, Platform, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, } from "react-native";
import Svg,{Circle,ClipPath,Defs,G,Path} from 'react-native-svg'

export default class Pie extends React.Component{
    //static title = 'Draw a Pie shape with circle';
    constructor(props) {
        super(props);
        this.state={
            pct_porn:0,
            pct_face:0,
        }
        this.data = this.props.data?this.props.data:{all:0,others:0,porn:0,face:0}
        this.rect = this.props.rect?this.props.rect:{height:200,width:200}
        this.r = Math.min(this.rect.height,this.rect.width)/2
        this.center = this.props.center?this.props.center:{cx:this.rect.width/2,cy:this.rect.height/2}
        this.color = {red:'#A00000',blue:'#0074D9',gold:'#D4AF37',green:'#00A000',gray:'#ddd',white:'#fff'} //opacity={0.5}
        //this.colors= ['red','blue','gold','green','gray','white']
        //this.colorArr = ["#468966","#FFF0A5","#FFB03B","#B64926","#8E2800"];
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.data){
            //alert('pie.new_data='+JSON.stringify(nextProps.data))
            let pct_porn = this.pct(nextProps.data.porn,nextProps.data.all)
            let pct_face = this.pct(nextProps.data.face,nextProps.data.all)
            //this.data = nextProps.data
            this.setState({pct_porn,pct_face})
        }
    }
    /*shouldComponentUpdate(nextProps, nextState){
        //alert(JSON.stringify(nextProps.data))
        if(nextProps.data){
            //alert(JSON.stringify(nextProps.data))
            return true
        }else{
            return false
        }
    }*/
    sum(arr){
        var total=0;
        arr.map((d)=>{total=total+d})
        return total;
    }
    pct(n,t){
        //alert('pct: n='+n+' t='+t)
        if(t===0) return 0;
        return parseInt(100*n/t)
    }
    pie1(radius, value){
        const x = radius - Math.cos((2 * Math.PI) / (100 / value)) * radius
        const y = radius + Math.sin((2 * Math.PI) / (100 / value)) * radius
        const long = (value <= 50) ? 0 : 1
        const d = `M${radius},${radius} L${radius},${0}, A${radius},${radius} 0 ${long},1 ${y},${x} Z`
        return d
    }
    pie0(radius, value){
        const x = radius - Math.cos((2 * Math.PI) / (100 / value)) * radius
        const y = radius - Math.sin((2 * Math.PI) / (100 / value)) * radius
        const long = (value <= 50) ? 0 : 1
        const d = `M${radius},${radius} L${radius},${0}, A${radius},${radius} 0 ${long},0 ${y},${x} Z`
        return d
    }
    definePath(name,percent,direction){
      if(direction===1)
        return(
            <ClipPath id={name}>
              <Path d={this.pie1(this.r, percent, direction)} />
            </ClipPath>
        )
      else
        return(
            <ClipPath id={name}>
              <Path d={this.pie0(this.r, percent, direction)} />
            </ClipPath>
        )
    }
    render(){
        let arc_porn_name = 'porn_'+this.state.pct_porn
        let arc_face_name = 'face_'+this.state.pct_face
        //onPress={()=>alert('G.Circle.others')}
        return (
        <Svg width={this.rect.width} height={this.rect.height}>
          <Defs>
            {this.definePath(arc_porn_name,this.state.pct_porn,0)}
            {this.definePath(arc_face_name,this.state.pct_face,1)}
          </Defs>
          <G>
            <Circle cx={this.center.cx} cy={this.center.cy} r={this.r} fill={this.color.gray} />
            <Circle cx={this.center.cx} cy={this.center.cy} r={this.r} clipPath={'url(#'+arc_porn_name+')'} fillOpacity={0.5} fill={this.color.red} />
            <Circle cx={this.center.cx} cy={this.center.cy} r={this.r} clipPath={'url(#'+arc_face_name+')'} fillOpacity={0.5} fill={this.color.green} />
          </G>
        </Svg>
        )
    }
}
