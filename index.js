import React, {Component} from 'react'
import ReactNative, {StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, ViewPagerAndroid, Platform} from 'react-native'

class CardsView extends Component {
  constructor(props) {
    super(props);
    this.scrollView = null;
    this.state = {
      width: 0,
      height: 0,
      childDimensions: []
    }
  }
  
  onScroll (options) {
  }
  
  getCardIndex(offset, velocity) {
    const VELOCITY_SCALE  = 0.6;
    console.log(velocity.x);
    const velocityOffset = {x:0, y:0};
    
    const CUTOFF_MIN = 0.5;
    const CUTOFF_MAX = 1.7;
    
    if(velocity.x <= -CUTOFF_MAX) velocityOffset.x = -this.state.width;
    else if(velocity.x < -CUTOFF_MIN) velocityOffset.x = this.state.width * 0.5 * (velocity.x/CUTOFF_MAX);
    else if(velocity.x <= CUTOFF_MIN) velocityOffset.x = 0;
    else if(velocity.x < CUTOFF_MAX) velocityOffset.x = this.state.width * 0.5 * (velocity.x/CUTOFF_MAX);
    else velocityOffset.x = this.state.width;
    
    if(velocity.y <= -CUTOFF_MAX) velocityOffset.y = -this.state.height;
    else if(velocity.y < -CUTOFF_MIN) velocityOffset.y = -this.state.height * 0.5 * (velocity.y/CUTOFF_MAX);
    else if(velocity.y <= CUTOFF_MIN) velocityOffset.y = 0;
    else if(velocity.y < CUTOFF_MAX) velocityOffset.y = this.state.height * 0.5 * (velocity.y/CUTOFF_MAX);
    else velocityOffset.y = this.state.height;
    
    console.log(`${velocity.x} :: ${velocityOffset.x}`)
    const center = {x:this.state.width * 0.5 + offset.x + velocityOffset.x, y: this.state.height * 0.5 + offset.y + velocityOffset.y};

    if(this.state.childDimensions) {
      if(this.props.horizontal && center.x < 0) return 0;
      else if(!this.props.horizontal && center.y < 0) return 0;
      
      for(var i = 0; i < this.state.childDimensions.length; i++) {
        const dimension = this.state.childDimensions[i];
        if(this.props.horizontal && center.x >= dimension.x && center.x < dimension.x + dimension.width) return i;
        if(!this.props.horizontal && center.y >= dimension.y && center.y < dimension.y + dimension.height) return i;
      }
      
      return this.state.childDimensions.length - 1;
    }
  }
  
  onScrollEndDrag(e) { 
    const index = this.getCardIndex(e.nativeEvent.contentOffset, e.nativeEvent.velocity) ;
    
    const firstItemDim = this.state.childDimensions[0];
    const dimension = this.state.childDimensions[index];
    const x = dimension.x + (dimension.width - firstItemDim.width)/2;
    const y = dimension.y + (dimension.height - firstItemDim.height)/2;
    
    if(this.props.horizontal) this.scrollView.scrollTo({x});
    else this.scrollView.scrollTo({y});
  }

  getCardWidth(child, layoutWidth, layoutHeight) {
    if(child == null) return layoutWidth;
    if(child.props.cardWidth == null) return layoutWidth;
    if(child.props.cardWidth instanceof Function) {
      return parseFloat(child.props.cardWidth({width: layoutWidth, height: layoutHeight}));
    } else {
      return parseFloat(child.props.cardWidth)
    }
  }

  getCardHeight(child, layoutWidth, layoutHeight) {
    if(child == null) return layoutHeight;
    if(child.props.cardHeight == null) return layoutHeight;
    if(child.props.cardHeight instanceof Function) {
      return parseFloat(child.props.cardHeight({width: layoutWidth, height: layoutHeight}));
    } else {
      return parseFloat(child.props.cardHeight)
    }
  }
  
  onLayout(e) {
    const layoutWidth = e.nativeEvent.layout.width || 0;
    const layoutHeight = e.nativeEvent.layout.height || 0;
    
    let dimAcc = {x:0, y:0};
    const childDimensions = this.props.children && this.props.children.map( (child, i) => {
      const width = this.getCardWidth(child, layoutWidth, layoutHeight);
      const height = this.getCardHeight(child, layoutWidth, layoutHeight);
      const x = dimAcc.x;
      const y = dimAcc.y;
      dimAcc.x += width;
      dimAcc.y += height;
      return {width, height, x, y}
    });
    
    this.setState({ width: layoutWidth, height: layoutHeight, childDimensions })
  }
  
  render() {
    const children = this.props.children.map( (child, i) => {
      const dimensions = this.state.childDimensions[i];
      var st = {};
      if(dimensions && dimensions.width) st.width = dimensions.width;
      if(dimensions && dimensions.height) st.height = dimensions.height;
      return <View style={st} key={i}>{child}</View>
    })
    const paddingLeft = this.state.childDimensions && this.state.childDimensions[0] && this.state.childDimensions[0].width? (this.state.width - this.state.childDimensions[0].width)/2: 0
    const paddingRight = this.state.childDimensions && this.state.childDimensions[this.state.childDimensions.length - 1] && this.state.childDimensions[this.state.childDimensions.length - 1].width? (this.state.width - this.state.childDimensions[this.state.childDimensions.length - 1].width)/2 :0
    
    const paddingTop = this.state.childDimensions && this.state.childDimensions[0] && this.state.childDimensions[0].height? (this.state.height - this.state.childDimensions[0].height)/2: 0
    const paddingBottom = this.state.childDimensions && this.state.childDimensions[this.state.childDimensions.length - 1] && this.state.childDimensions[this.state.childDimensions.length - 1].height? (this.state.height - this.state.childDimensions[this.state.childDimensions.length - 1].height)/2 :0
    
    
    return <ScrollView
      ref={(scrollView) => { this.scrollView = scrollView; }}
      onScrollEndDrag={this.onScrollEndDrag.bind(this)}
      onScroll={this.onScroll.bind(this)}
      scrollEventThrottle={100}
      horizontal={this.props.horizontal}
      onLayout={this.onLayout.bind(this)}
      contentContainerStyle={{paddingLeft, paddingRight, paddingTop, paddingBottom}}>
      {children}
  </ScrollView>
  }
}

CardsView.defaultProps = {
  horizontal : true,
}

export default CardsView;
